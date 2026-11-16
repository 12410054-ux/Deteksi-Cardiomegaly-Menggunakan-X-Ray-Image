import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns

IMG_SIZE = 160
BATCH_SIZE = 16
test_dir = "test"

# ======================
# LOAD MODEL
# ======================
model_name = "model_cardiomegaly_transfer_finetuned.keras"
model_path = os.path.join("models", model_name)
if not os.path.exists(model_path):
    model_path = model_name
model = load_model(model_path)
model.summary()

# ======================
# DATA GENERATOR
# ======================
test_datagen = ImageDataGenerator(rescale=1./255)

test_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode="rgb",
    batch_size=BATCH_SIZE,
    class_mode="binary",
    shuffle=False  # wajib untuk evaluasi
)

labels = sorted(test_generator.class_indices, key=test_generator.class_indices.get)
print("Urutan kelas:", test_generator.class_indices)

# ======================
# EVALUATE & PREDICT
# ======================
loss, accuracy = model.evaluate(test_generator)
print(f"\nTest Accuracy: {accuracy:.4f}")
print(f"Test Loss: {loss:.4f}")

predictions = model.predict(test_generator).reshape(-1)   # peluang kelas 1
y_pred = (predictions > 0.5).astype(int)
y_true = test_generator.classes

# ======================
# CLASSIFICATION REPORT & CONFUSION MATRIX
# ======================
print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=labels, digits=4))

cm = confusion_matrix(y_true, y_pred)
print("\nConfusion Matrix (baris = aktual, kolom = prediksi):")
print(labels)
print(cm)

os.makedirs("evaluation_reports", exist_ok=True)

plt.figure(figsize=(4.5, 3.5))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
            xticklabels=labels, yticklabels=labels)
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.title("Confusion Matrix of MobileNetV2 Model")
plt.tight_layout()
plt.savefig("evaluation_reports/confusion_matrix_mobilenetv2.png", dpi=300)
plt.show()

# ======================
# ROC CURVE (Kardiomegali sebagai kelas positif)
# ======================
pos_is_zero = labels[0].lower().startswith("card")
if pos_is_zero:
    y_pos = 1 - y_true
    score_pos = 1 - predictions
else:
    y_pos = y_true
    score_pos = predictions

fpr, tpr, _ = roc_curve(y_pos, score_pos)
roc_auc = auc(fpr, tpr)
print(f"\nAUC Score: {roc_auc:.4f}")

plt.figure(figsize=(4.5, 3.5))
plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.4f}")
plt.plot([0, 1], [0, 1], linestyle="--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate (Kardiomegali)")
plt.title("ROC Curve - MobileNetV2 Model")
plt.legend()
plt.tight_layout()
plt.savefig("evaluation_reports/roc_curve_mobilenetv2.png", dpi=300)
plt.show()