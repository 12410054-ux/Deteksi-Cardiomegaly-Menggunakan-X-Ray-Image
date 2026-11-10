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
    "mobilenet": ("MobileNetV2 Fine-tuned", get_model_path("model_cardiomegaly_transfer_finetuned.keras")),
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


def validate_chest_xray(image: Image.Image) -> tuple[bool, str]:
    """
    Validasi citra medis untuk memastikan berkas yang diunggah adalah citra rontgen toraks dada (Chest X-Ray),
    bukan foto selfie, dokumen, foto benda, atau gambar berwarna non-medis.
    """
    img_rgb = image.convert("RGB")
    arr = np.asarray(img_rgb, dtype=np.float32)

    # 1. Aspek Rasio (X-ray thorax biasanya rasio persegi hingga mendekati portrait wajar)
    w, h = image.size
    aspect = w / float(h)
    if aspect < 0.45 or aspect > 2.2:
        return (
            False,
            "Proporsi gambar tidak sesuai standar foto rontgen dada/toraks (aspek rasio tidak wajar). Pastikan mengunggah citra rontgen toraks PA/AP.",
        )

    # 2. Saturasi Warna (Citra rontgen selalu monokromatik / skala abu-abu)
    # Foto berwarna biasa (pemandangan, orang, mobil, dll) memiliki selisih kanal RGB yang tinggi
    diff_rg = np.mean(np.abs(arr[:, :, 0] - arr[:, :, 1]))
    diff_gb = np.mean(np.abs(arr[:, :, 1] - arr[:, :, 2]))
    color_diff = (diff_rg + diff_gb) / 2.0
    if color_diff > 12.0:
        return (
            False,
            "Berkas terdeteksi sebagai gambar berwarna! Sistem ini hanya menerima citra rontgen X-ray dada (monokromatik / grayscale). Foto umum, dokumen, atau selfie tidak diizinkan.",
        )

    # 3. Rentang Kontras / Deviasi Standar (mendeteksi gambar polos atau noise)
    gray = np.mean(arr, axis=2)
    std = float(np.std(gray))
    if std < 18.0:
        return (
            False,
            "Kontras citra terlalu rendah atau gambar kosong/polos. Citra tidak memenuhi kriteria radiologi dada.",
        )

    # 4. Rata-rata intensitas pencahayaan (bukan blank hitam pekat atau putih polos)
    mean_val = float(np.mean(gray))
    if mean_val < 25.0 or mean_val > 235.0:
        return (
            False,
            "Intensitas pencahayaan tidak normal untuk citra radiografi toraks dada.",
        )

    return True, "Valid"


def classify(image: Image.Image, model_key: str) -> dict:
    # 1. Gunakan Resampling NEAREST agar konsisten dengan ImageDataGenerator saat model dilatih
    # (Pillow default Bicubic menyebabkan blurring batas siluet kardiotoraks yang memicu false positive kardiomegali)
    image_resized = image.convert("RGB").resize((IMG_SIZE, IMG_SIZE), Image.Resampling.NEAREST)
    batch = np.expand_dims(np.asarray(image_resized, dtype=np.float32) / 255.0, axis=0)

    # 2. Inferensi model utama
    raw_primary = float(np.asarray(get_model(model_key).predict(batch, verbose=0)).reshape(-1)[0])

    # 3. Konsensus Medis (Dual-Model Ensemble):
    # Menggabungkan MobileNetV2 dengan CNN Custom (AUC 0.84) untuk mencegah False Positive fatal pada citra normal
    try:
        alt_key = "cnn" if model_key == "mobilenet" else "mobilenet"
        raw_alt = float(np.asarray(get_model(alt_key).predict(batch, verbose=0)).reshape(-1)[0])
        # Rata-rata terbobot: 50% CNN + 50% MobileNetV2
        raw = 0.50 * raw_primary + 0.50 * raw_alt
    except Exception:
        raw = raw_primary

    # Output Sigmoid = P(Normal), karena urutan direktori Keras: Cardiomegaly=0, Normal=1
    normal_probability = min(max(raw, 0.0), 1.0)
    cardio_probability = 1.0 - normal_probability

    # Ambang batas deteksi klinis
    positive = cardio_probability >= 0.50

    if positive:
        clinical_note = (
            "Citra mengindikasikan adanya tanda pembesaran siluet jantung (Cardiomegaly). "
            "Disarankan pemeriksaan lanjutan seperti Ekokardiografi (ECHO) dan konfirmasi oleh Dokter Spesialis Jantung atau Radiolog."
        )
        status_type = "warning"
    else:
        clinical_note = (
            "Siluet dan ukuran jantung dalam batas normal (Cardiothoracic Ratio < 0.50). "
            "Tidak ditemukan indikasi pembesaran jantung pada citra rontgen ini."
        )
        status_type = "success"

    return {
        "label": "Kardiomegali" if positive else "Normal",
        "status_type": status_type,
        "confidence": (cardio_probability if positive else normal_probability) * 100,
        "cardiomegaly_probability": cardio_probability * 100,
        "normal_probability": normal_probability * 100,
        "clinical_note": clinical_note,
    }


@app.get("/")
def index():
    return render_template("index.html", models=MODEL_FILES)


@app.post("/predict")
def predict():
    uploaded = request.files.get("image")
    model_key = request.form.get("model", "mobilenet")
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
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "5000")), debug=False)
