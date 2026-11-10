"""Test otomatis untuk aplikasi Ruang Rontgen.

Menguji:
  1. Import semua modul
  2. Load kedua model (.keras)
  3. Flask app start & endpoint /predict
  4. Prediksi dengan gambar test (Normal & Cardiomegaly)
  5. Validasi response JSON
  6. Error handling (file invalid, tanpa gambar)
"""

import sys
import os
import json
import time
import threading

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PASSED = 0
FAILED = 0
TOTAL = 0


def test(name, condition, detail=""):
    global PASSED, FAILED, TOTAL
    TOTAL += 1
    if condition:
        PASSED += 1
        print(f"  ✅ PASS: {name}")
    else:
        FAILED += 1
        print(f"  ❌ FAIL: {name}" + (f" — {detail}" if detail else ""))


# ============================================
# TEST 1: Import Modules
# ============================================
print("\n" + "=" * 55)
print("  TEST 1: Import Modules")
print("=" * 55)

try:
    import numpy as np
    test("import numpy", True)
except ImportError as e:
    test("import numpy", False, str(e))

try:
    import tensorflow as tf
    test("import tensorflow", True)
    print(f"         TensorFlow version: {tf.__version__}")
except ImportError as e:
    test("import tensorflow", False, str(e))

try:
    from flask import Flask
    test("import flask", True)
except ImportError as e:
    test("import flask", False, str(e))

try:
    from PIL import Image
    test("import Pillow (PIL)", True)
except ImportError as e:
    test("import Pillow", False, str(e))

try:
    from sklearn.metrics import classification_report
    test("import scikit-learn", True)
except ImportError as e:
    test("import scikit-learn", False, str(e))

try:
    import cv2
    test("import opencv", True)
except ImportError as e:
    test("import opencv", False, str(e))

# ============================================
# TEST 2: Load Models
# ============================================
print("\n" + "=" * 55)
print("  TEST 2: Load Models")
print("=" * 55)

from tensorflow.keras.models import load_model

# CNN model
t0 = time.time()
try:
    cnn_path = os.path.join("models", "cnn_model.keras") if os.path.exists(os.path.join("models", "cnn_model.keras")) else "cnn_model.keras"
    cnn_model = load_model(cnn_path, compile=False)
    t_cnn = time.time() - t0
    test("Load CNN model", True)
    print(f"         Waktu load: {t_cnn:.2f}s")
    print(f"         Input shape: {cnn_model.input_shape}")
    print(f"         Output shape: {cnn_model.output_shape}")
    print(f"         Parameters: {cnn_model.count_params():,}")
except Exception as e:
    test("Load CNN model", False, str(e))
    cnn_model = None

# MobileNetV2 model
t0 = time.time()
try:
    mobilenet_model = load_model(
        os.path.join("models", "model_cardiomegaly_transfer_finetuned.keras") if os.path.exists(os.path.join("models", "model_cardiomegaly_transfer_finetuned.keras")) else os.path.join("models", "model_cardiomegaly_transfer_finetuned.keras"), compile=False
    )
    t_mn = time.time() - t0
    test("Load MobileNetV2 model", True)
    print(f"         Waktu load: {t_mn:.2f}s")
    print(f"         Input shape: {mobilenet_model.input_shape}")
    print(f"         Output shape: {mobilenet_model.output_shape}")
    print(f"         Parameters: {mobilenet_model.count_params():,}")
except Exception as e:
    test("Load MobileNetV2 model", False, str(e))
    mobilenet_model = None

# ============================================
# TEST 3: Prediksi Langsung (tanpa Flask)
# ============================================
print("\n" + "=" * 55)
print("  TEST 3: Prediksi Langsung (tanpa Flask)")
print("=" * 55)

IMG_SIZE = 160

# Ambil 1 gambar Normal dan 1 Cardiomegaly dari test set
test_normal = os.path.join("test", "Normal", os.listdir("test/Normal")[0])
test_cardio = os.path.join(
    "test", "Cardiomegaly", os.listdir("test/Cardiomegaly")[0]
)

for label, img_path in [("Normal", test_normal), ("Cardiomegaly", test_cardio)]:
    try:
        img = Image.open(img_path).convert("RGB").resize((IMG_SIZE, IMG_SIZE))
        arr = np.expand_dims(np.asarray(img, dtype=np.float32) / 255.0, axis=0)

        # CNN prediction (sigmoid = P(Normal), Cardiomegaly=0, Normal=1)
        pred_cnn = float(cnn_model.predict(arr, verbose=0).reshape(-1)[0])
        cnn_label = "Normal" if pred_cnn >= 0.5 else "Cardiomegaly"

        # MobileNetV2 prediction
        pred_mn = float(mobilenet_model.predict(arr, verbose=0).reshape(-1)[0])
        mn_label = "Normal" if pred_mn >= 0.5 else "Cardiomegaly"

        test(
            f"Prediksi CNN [{label}]",
            0.0 <= pred_cnn <= 1.0,
            f"prob={pred_cnn:.4f}, pred={cnn_label}",
        )
        test(
            f"Label CNN benar [{label}]",
            cnn_label == label,
            f"expected={label}, got={cnn_label}",
        )
        print(f"         Prob: {pred_cnn:.4f} → {cnn_label}")

        test(
            f"Prediksi MobileNetV2 [{label}]",
            0.0 <= pred_mn <= 1.0,
            f"prob={pred_mn:.4f}, pred={mn_label}",
        )
        test(
            f"Label MobileNetV2 benar [{label}]",
            mn_label == label,
            f"expected={label}, got={mn_label}",
        )
        print(f"         Prob: {pred_mn:.4f} → {mn_label}")

    except Exception as e:
        test(f"Prediksi {label}", False, str(e))

# ============================================
# TEST 4: Flask App & Endpoint /predict
# ============================================
print("\n" + "=" * 55)
print("  TEST 4: Flask App & Endpoint /predict")
print("=" * 55)

# Import the Flask app
sys.path.insert(0, ".")
from app import app as flask_app

flask_app.config["TESTING"] = True
client = flask_app.test_client()

# Test GET /
resp = client.get("/")
test("GET / → 200", resp.status_code == 200)
test("GET / → HTML page", b"Ruang Rontgen" in resp.data or b"ruangrontgen" in resp.data)

# Test POST /predict tanpa gambar
resp = client.post("/predict")
test("POST /predict tanpa gambar → 400", resp.status_code == 400)
data = resp.get_json()
test("Response JSON has 'error'", "error" in data)

# Test POST /predict dengan gambar Normal
with open(test_normal, "rb") as f:
    resp = client.post(
        "/predict",
        data={"image": (f, "test_normal.png"), "model": "mobilenet"},
        content_type="multipart/form-data",
    )
test("POST /predict [Normal, mobilenet] → 200", resp.status_code == 200)
data = resp.get_json()
test("Response has 'label'", "label" in data)
test("Response has 'confidence'", "confidence" in data)
test("Response has 'cardiomegaly_probability'", "cardiomegaly_probability" in data)
test("Response has 'normal_probability'", "normal_probability" in data)
test("Response has 'model_name'", "model_name" in data)
test("Response has 'image_url'", "image_url" in data)
test(
    "label is valid",
    data.get("label") in ["Normal", "Kardiomegali"],
    f"got: {data.get('label')}",
)
test(
    "confidence 0-100",
    0 <= data.get("confidence", -1) <= 100,
    f"got: {data.get('confidence')}",
)
test(
    "probabilities sum ~100",
    abs(data.get("cardiomegaly_probability", 0) + data.get("normal_probability", 0) - 100) < 1,
)
test(
    "Flask: Normal image → label Normal",
    data.get("label") == "Normal",
    f"expected Normal, got {data.get('label')}",
)
print(f"         Response: {json.dumps(data, indent=2, ensure_ascii=False)}")

# Test POST /predict dengan gambar Cardiomegaly + model CNN
with open(test_cardio, "rb") as f:
    resp = client.post(
        "/predict",
        data={"image": (f, "test_cardio.png"), "model": "cnn"},
        content_type="multipart/form-data",
    )
test("POST /predict [Cardiomegaly, cnn] → 200", resp.status_code == 200)
data2 = resp.get_json()
test(
    "CNN label is valid",
    data2.get("label") in ["Normal", "Kardiomegali"],
    f"got: {data2.get('label')}",
)
test(
    "Flask: Cardiomegaly image → label Kardiomegali",
    data2.get("label") == "Kardiomegali",
    f"expected Kardiomegali, got {data2.get('label')}",
)
print(f"         Response: {json.dumps(data2, indent=2, ensure_ascii=False)}")

# Test invalid model
with open(test_normal, "rb") as f:
    resp = client.post(
        "/predict",
        data={"image": (f, "test.png"), "model": "invalid_model"},
        content_type="multipart/form-data",
    )
test("POST /predict [invalid model] → 400", resp.status_code == 400)

# Test invalid file type
from io import BytesIO

resp = client.post(
    "/predict",
    data={"image": (BytesIO(b"not an image"), "test.txt"), "model": "mobilenet"},
    content_type="multipart/form-data",
)
test("POST /predict [.txt file] → 400", resp.status_code == 400)

# ============================================
# TEST 5: File Struktur & Deployment Files
# ============================================
print("\n" + "=" * 55)
print("  TEST 5: File Struktur & Deployment")
print("=" * 55)

required_files = [
    "app.py",
    "requirements.txt",
    "README.md",
    "Dockerfile",
    "Procfile",
    "render.yaml",
    "runtime.txt",
    ".gitignore",
    ".dockerignore",
    "hyperparameter_tuning.py",
    "error_analysis.py",
    "train_cnn.py",
    "train_transfer.py",
    "evaluasi_cnn.py",
    "evaluasi_transfer.py",
    "duamodel.py",
    "gradcame_transfer.py",
    "predict.py",
    os.path.join("models", "cnn_model.keras"),
    os.path.join("models", "model_cardiomegaly_transfer_finetuned.keras"),
    "templates/index.html",
    "static/style.css",
    "static/app.js",
]

for f in required_files:
    exists = os.path.exists(f)
    test(f"File exists: {f}", exists)

# Check .git
test("Git initialized (.git/)", os.path.isdir(".git"))

# ============================================
# RINGKASAN
# ============================================
print("\n" + "=" * 55)
print(f"  RINGKASAN: {PASSED}/{TOTAL} PASSED, {FAILED} FAILED")
print("=" * 55)

if FAILED == 0:
    print("\n  🎉 SEMUA TEST BERHASIL! Aplikasi siap digunakan.\n")
else:
    print(f"\n  ⚠️  Ada {FAILED} test yang gagal. Periksa output di atas.\n")

sys.exit(0 if FAILED == 0 else 1)
