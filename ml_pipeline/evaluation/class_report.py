import os
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

IMG_SIZE = 160
BATCH_SIZE = 16

# Path dihitung dari lokasi file ini, bukan dari folder terminal
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
model_path = os.path.join(BASE_DIR, "models", "cnn_model.keras")
test_dir = os.path.join(BASE_DIR, "test")

# Cek dulu supaya pesan error jelas
if not os.path.isfile(model_path):
    raise FileNotFoundError(f"Model tidak ditemukan: {model_path}")
if not os.path.isdir(test_dir):
    raise FileNotFoundError(f"Folder test tidak ditemukan: {test_dir}")

model = load_model(model_path)

test_datagen = ImageDataGenerator(rescale=1./255)
test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode="rgb",
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False          # wajib False agar urutan prediksi = urutan label
)

y_prob = model.predict(test_generator, verbose=0)
y_pred = (y_prob > 0.5).astype(int).ravel()
y_true = test_generator.classes
class_names = list(test_generator.class_indices.keys())

print("Class mapping:", test_generator.class_indices)
print("Accuracy:", accuracy_score(y_true, y_pred))
print("\nClassification Report:\n")
print(classification_report(y_true, y_pred, target_names=class_names, digits=4))
print("Confusion Matrix:\n", confusion_matrix(y_true, y_pred))