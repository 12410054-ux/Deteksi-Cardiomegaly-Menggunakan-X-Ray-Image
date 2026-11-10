import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt

IMG_SIZE = 160
BATCH_SIZE = 16

test_dir = "test"

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
# CNN MODEL
# ======================
cnn_model = load_model("cnn_model.keras")
cnn_pred = cnn_model.predict(test_generator)
fpr_cnn, tpr_cnn, _ = roc_curve(y_true, cnn_pred)
auc_cnn = auc(fpr_cnn, tpr_cnn)

# ======================
# MobileNetV2 MODEL
# ======================
mobilenet_model = load_model("model_cardiomegaly_transfer_finetuned.keras")
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
plt.savefig("roc_comparison.png", dpi=300)

plt.show()