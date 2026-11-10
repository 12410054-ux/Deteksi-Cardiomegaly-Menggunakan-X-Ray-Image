import tensorflow as tf
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns

IMG_SIZE = 160
BATCH_SIZE = 16

test_dir = "test"

# ======================
# LOAD MODEL
# ======================
model = load_model(os.path.join("models", "model_cardiomegaly_transfer_finetuned.keras") if os.path.exists(os.path.join("models", "model_cardiomegaly_transfer_finetuned.keras")) else "model_cardiomegaly_transfer_finetuned.keras")
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
    shuffle=False  # WAJIB untuk evaluasi
)

# ======================
# EVALUATE MODEL
# ======================
loss, accuracy = model.evaluate(test_generator)
print(f"\nTest Accuracy: {accuracy:.4f}")
print(f"Test Loss: {loss:.4f}")

# ======================
# PREDICTION
# ======================
predictions = model.predict(test_generator)
y_pred = (predictions > 0.5).astype(int).reshape(-1)
y_true = test_generator.classes

# ======================
# CLASSIFICATION REPORT
# ======================
print("\nClassification Report:")
print(classification_report(y_true, y_pred))

# ======================
# CONFUSION MATRIX (TEXT)
# ======================
cm = confusion_matrix(y_true, y_pred)
print("\nConfusion Matrix:")
print(cm)

# ======================
# CONFUSION MATRIX (VISUAL - IEEE READY)
# ======================
#plt.figure(figsize=(4.5, 3.5))  # ukuran sesuai paper IEEE

#sns.heatmap(
#    cm,
#    annot=True,
#    fmt='d',
#    cmap='Blues',
#    cbar=False,
#    xticklabels=['Normal', 'Cardiomegaly'],
#    yticklabels=['Normal', 'Cardiomegaly']
#)

#plt.xlabel('Predicted Label')
#plt.ylabel('True Label')
#plt.title('Confusion Matrix of MobileNetV2 Model')

#plt.tight_layout()

# SAVE gambar (WAJIB untuk paper)
#plt.savefig("confusion_matrix_mobilenetv2.png", dpi=300)

#plt.show()

# ======================
# ROC CURVE
# ======================
fpr, tpr, thresholds = roc_curve(y_true, predictions)
roc_auc = auc(fpr, tpr)

print(f"\nAUC Score: {roc_auc:.4f}")

plt.figure(figsize=(4.5, 3.5))
plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.4f}")
plt.plot([0, 1], [0, 1], linestyle='--')

plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve - MobileNetV2 Model")
plt.legend()

plt.tight_layout()
os.makedirs("evaluation_reports", exist_ok=True); plt.savefig("evaluation_reports/roc_curve_mobilenetv2.png", dpi=300)

plt.show()