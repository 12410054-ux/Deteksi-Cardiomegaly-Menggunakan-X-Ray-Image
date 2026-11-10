"""Web interface for the trained chest X-ray classifiers."""
from __future__ import annotations

import os
from pathlib import Path
from uuid import uuid4

import numpy as np
from flask import Flask, jsonify, render_template, request, url_for
from PIL import Image, UnidentifiedImageError
from tensorflow.keras.models import load_model

ROOT = Path(__file__).resolve().parent
UPLOAD_DIR = ROOT / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
IMG_SIZE = 160

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_BYTES

MODEL_FILES = {
    "mobilenet": ("MobileNetV2 Fine-tuned", ROOT / "model_cardiomegaly_transfer_finetuned.keras"),
    "cnn": ("CNN", ROOT / "cnn_model.keras"),
}
_models = {}


def get_model(model_key: str):
    if model_key not in MODEL_FILES:
        raise ValueError("Model yang dipilih tidak tersedia.")
    if model_key not in _models:
        label, path = MODEL_FILES[model_key]
        if not path.is_file():
            raise FileNotFoundError(f"Berkas model {label} tidak ditemukan: {path.name}")
        _models[model_key] = load_model(path, compile=False)
    return _models[model_key]


def classify(image: Image.Image, model_key: str) -> dict:
    image = image.convert("RGB").resize((IMG_SIZE, IMG_SIZE))
    batch = np.expand_dims(np.asarray(image, dtype=np.float32) / 255.0, axis=0)
    raw = float(np.asarray(get_model(model_key).predict(batch, verbose=0)).reshape(-1)[0])
    # Sigmoid output = P(Normal), karena flow_from_directory: Cardiomegaly=0, Normal=1
    normal_probability = min(max(raw, 0.0), 1.0)
    cardio_probability = 1.0 - normal_probability
    positive = cardio_probability >= 0.5
    return {
        "label": "Kardiomegali" if positive else "Normal",
        "confidence": (cardio_probability if positive else normal_probability) * 100,
        "cardiomegaly_probability": cardio_probability * 100,
        "normal_probability": normal_probability * 100,
    }


@app.get("/")
def index():
    return render_template("index.html", models=MODEL_FILES)


@app.post("/predict")
def predict():
    uploaded = request.files.get("image")
    model_key = request.form.get("model", "mobilenet")
    if not uploaded or not uploaded.filename:
        return jsonify(error="Pilih gambar rontgen terlebih dahulu."), 400
    if Path(uploaded.filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        return jsonify(error="Gunakan gambar PNG, JPG, JPEG, atau WEBP."), 400
    try:
        image = Image.open(uploaded.stream)
        image.load()
        result = classify(image, model_key)
    except (UnidentifiedImageError, OSError):
        return jsonify(error="Berkas tidak dapat dibaca sebagai gambar."), 400
    except (ValueError, FileNotFoundError) as exc:
        return jsonify(error=str(exc)), 400
    except Exception:
        app.logger.exception("Inference failed")
        return jsonify(error="Prediksi gagal. Periksa model dan dependensi aplikasi."), 500

    image.thumbnail((1400, 1400))
    image_path = UPLOAD_DIR / f"{uuid4().hex}.jpg"
    image.save(image_path, "JPEG", quality=90)
    result.update(
        image_url=url_for("static", filename=f"uploads/{image_path.name}"),
        model_name=MODEL_FILES[model_key][0],
    )
    return jsonify(result)


@app.errorhandler(413)
def too_large(_error):
    return jsonify(error="Ukuran gambar maksimal 10 MB."), 413


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=False)
