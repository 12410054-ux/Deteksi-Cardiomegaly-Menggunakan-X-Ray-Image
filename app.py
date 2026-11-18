"""Web interface for the trained chest X-ray classifiers with clinical UI."""
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

def get_model_path(filename: str) -> Path:
    models_dir_path = ROOT / "models" / filename
    if models_dir_path.is_file():
        return models_dir_path
    return ROOT / filename


MODEL_FILES = {
    "cnn": ("CNN Custom (4-Block)", get_model_path("cnn_model.keras")),
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


try:
    from ml_pipeline.utils.validator import validate_chest_xray
except ImportError:
    from validator import validate_chest_xray


def classify(image: Image.Image, model_key: str = "cnn") -> dict:
    if model_key not in MODEL_FILES:
        raise ValueError("Model yang dipilih tidak tersedia.")

    # 1. Gunakan Resampling NEAREST agar konsisten dengan ImageDataGenerator saat model dilatih
    # (Pillow default Bicubic menyebabkan blurring batas siluet kardiotoraks yang memicu false positive kardiomegali)
    image_resized = image.convert("RGB").resize((IMG_SIZE, IMG_SIZE), Image.Resampling.NEAREST)
    batch = np.expand_dims(np.asarray(image_resized, dtype=np.float32) / 255.0, axis=0)

    # 2. Prediksi nilai Sigmoid dari model CNN (persis seperti di predict.py)
    # Output Sigmoid = P(Normal), karena urutan folder Keras: Cardiomegaly=0, Normal=1
    prediction = float(get_model("cnn").predict(batch, verbose=0)[0][0])

    # 3. Perhitungan probabilitas & confidence (Percabangan langsung)
    if prediction < 0.5:
        label = "Kardiomegali"
        confidence = (1.0 - prediction) * 100          # <-- Probabilitas Kardiomegali (%)
        cardio_prob = confidence
        normal_prob = prediction * 100
        status_type = "warning"
        clinical_note = (
            "Citra mengindikasikan adanya tanda pembesaran siluet jantung (Cardiomegaly). "
            "Disarankan pemeriksaan lanjutan seperti Ekokardiografi (ECHO) dan konfirmasi oleh Dokter Spesialis Jantung atau Radiolog."
        )
    else:
        label = "Normal"
        confidence = prediction * 100                  # <-- Probabilitas Normal (%)
        normal_prob = confidence
        cardio_prob = (1.0 - prediction) * 100
        status_type = "success"
        clinical_note = (
            "Siluet dan ukuran jantung dalam batas normal (Cardiothoracic Ratio < 0.50). "
            "Tidak ditemukan indikasi pembesaran jantung pada citra rontgen ini."
        )

    return {
        "label": label,
        "status_type": status_type,
        "confidence": confidence,
        "cardiomegaly_probability": cardio_prob,
        "normal_probability": normal_prob,
        "clinical_note": clinical_note,
    }


@app.get("/")
def index():
    return render_template("index.html", models=MODEL_FILES)


@app.post("/predict")
def predict():
    uploaded = request.files.get("image")
    model_key = request.form.get("model", "cnn")
    if not uploaded or not uploaded.filename:
        return jsonify(error="Silakan pilih berkas citra rontgen dada terlebih dahulu."), 400
    if Path(uploaded.filename).suffix.lower() not in ALLOWED_EXTENSIONS:
        return jsonify(error="Format berkas tidak didukung. Harap gunakan format DICOM export (PNG, JPG, JPEG, atau WEBP)."), 400

    try:
        image = Image.open(uploaded.stream)
        image.load()
    except (UnidentifiedImageError, OSError):
        return jsonify(error="Berkas rusak atau tidak dapat dibaca sebagai format gambar yang valid."), 400

    # Validasi ketat: Hanya menerima Citra Rontgen Toraks Dada (Chest X-Ray)
    is_valid_xray, message = validate_chest_xray(image)
    if not is_valid_xray:
        return jsonify(error=message, is_validation_error=True), 400

    try:
        result = classify(image, model_key)
    except (ValueError, FileNotFoundError) as exc:
        return jsonify(error=str(exc)), 400
    except Exception:
        app.logger.exception("Inference failed")
        return jsonify(error="Proses inferensi gagal. Silakan periksa koneksi atau model AI."), 500

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
    return jsonify(error="Ukuran berkas melebihi batas maksimum (10 MB)."), 413


if __name__ == "__main__":
    app.run(
        host=os.environ.get("HOST", "0.0.0.0"),
        port=int(os.environ.get("PORT", "5000")),
        debug=False,
    )
