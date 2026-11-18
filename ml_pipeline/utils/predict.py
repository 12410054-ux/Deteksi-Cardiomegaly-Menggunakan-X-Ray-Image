import sys
import os
import cv2
import numpy as np
from PIL import Image
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, BASE_DIR)
from ml_pipeline.utils.validator import validate_chest_xray
IMG_SIZE = 160

# Model utama sistem: Custom CNN (4-Block)
model_path = os.path.join(BASE_DIR, "models", "cnn_model.keras")
if not os.path.exists(model_path):
    model_path = os.path.join(BASE_DIR, "cnn_model.keras")
model = load_model(model_path)

# Ambil dari argumen command line jika ada, atau gunakan default testing/cardiomegaly.png
if len(sys.argv) > 1:
    image_path = sys.argv[1]
else:
    image_path = os.path.join(BASE_DIR, "testing", "cardiomegaly.png")

if not os.path.exists(image_path):
    print("File gambar tidak ditemukan!")
    exit(1)

# Validasi citra rontgen toraks dada (Pre-screening check)
try:
    pil_img = Image.open(image_path)
    is_valid, validation_msg = validate_chest_xray(pil_img)
    if not is_valid:
        print("\n" + "=" * 60)
        print(" [PERINGATAN VALIDASI] Citra Ditolak!")
        print(" Alasan:", validation_msg)
        print("=" * 60)
        print("Sistem hanya dapat menganalisis citra rontgen toraks dada (Chest X-Ray).")
        exit(1)
except Exception as err:
    print(f"Gagal memuat atau memvalidasi berkas gambar: {err}")
    exit(1)

# Baca gambar RGB (bukan grayscale)
img = cv2.imread(image_path)
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

img_resized = cv2.resize(img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_NEAREST)

img_array = img_resized / 255.0
img_array = np.expand_dims(img_array, axis=0)

prediction = model.predict(img_array, verbose=0)[0][0]

# Sigmoid output = P(Normal), karena folder: Cardiomegaly=0, Normal=1
if prediction < 0.5:
    result = "Cardiomegaly (Pembesaran Jantung)"
    confidence = (1 - prediction) * 100
else:
    result = "Normal"
    confidence = prediction * 100

print("Hasil:", result)
print("Confidence: %.2f%%" % confidence)

plt.imshow(img)
plt.title(f"{result} ({confidence:.2f}%)")
plt.axis("off")
plt.show()
