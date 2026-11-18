"""Script Analisis Komparatif: Membandingkan performa Custom CNN vs MobileNetV2."""
import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IMG_SIZE = 160
BATCH_SIZE = 16

test_dir = os.path.join(BASE_DIR, "test")

# ======================
# DATA GENERATOR (SAMA UNTUK KEDUA MODEL)
# ======================
test_datagen = ImageDataGenerator(rescale=1./255)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode="rgb",
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False
)

y_true = test_generator.classes

# ======================
# CNN MODEL (Model Utama)
# ======================
cnn_path = os.path.join(BASE_DIR, "models", "cnn_model.keras")
if not os.path.exists(cnn_path):
    cnn_path = os.path.join(BASE_DIR, "cnn_model.keras")
cnn_model = load_model(cnn_path)
cnn_pred = cnn_model.predict(test_generator)
fpr_cnn, tpr_cnn, _ = roc_curve(y_true, cnn_pred)
auc_cnn = auc(fpr_cnn, tpr_cnn)

# ======================
# MobileNetV2 MODEL (Model Pembanding)
# ======================
mobilenet_path = os.path.join(BASE_DIR, "models", "model_cardiomegaly_transfer_finetuned.keras")
if not os.path.exists(mobilenet_path):
    mobilenet_path = os.path.join(BASE_DIR, "model_cardiomegaly_transfer_finetuned.keras")
mobilenet_model = load_model(mobilenet_path)
mobilenet_pred = mobilenet_model.predict(test_generator)
fpr_m, tpr_m, _ = roc_curve(y_true, mobilenet_pred)
auc_m = auc(fpr_m, tpr_m)

# ======================
# PLOT ROC COMPARISON (IEEE STYLE)
# ======================
plt.figure(figsize=(4.5, 3.5))  # ukuran IEEE 1 kolom

plt.plot(fpr_cnn, tpr_cnn, label=f'CNN (AUC = {auc_cnn:.3f})')
plt.plot(fpr_m, tpr_m, label=f'MobileNetV2 (AUC = {auc_m:.3f})')

# Random line
plt.plot([0, 1], [0, 1], linestyle='--')

plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve Comparison")
plt.legend()

plt.tight_layout()

# SAVE (WAJIB UNTUK PAPER)
reports_dir = os.path.join(BASE_DIR, "evaluation_reports")
os.makedirs(reports_dir, exist_ok=True)
save_plot_path = os.path.join(reports_dir, "roc_comparison.png")
plt.savefig(save_plot_path, dpi=300)
print(f"Grafik perbandingan ROC berhasil disimpan ke '{save_plot_path}'")

plt.show()