"""Analisis error dan SHAP-like explainability untuk model klasifikasi.

Script ini:
  1. Mengidentifikasi sampel yang salah diklasifikasikan (misclassified)
  2. Menampilkan distribusi error berdasarkan confidence
  3. Menghasilkan visualisasi Grad-CAM untuk sampel yang salah
  4. Menyimpan laporan error analysis

Jalankan:
    python error_analysis.py

Output disimpan di folder `error_analysis_output/`.
"""

import os
import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from tensorflow.keras.models import load_model, Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from sklearn.metrics import classification_report, confusion_matrix
import tensorflow as tf
import cv2

IMG_SIZE = 160
BATCH_SIZE = 16
OUTPUT_DIR = "error_analysis_output"

os.makedirs(OUTPUT_DIR, exist_ok=True)

CLASS_NAMES = ["Cardiomegaly", "Normal"]

# ======================
# PILIH MODEL
# ======================
MODELS = {
    "CNN": os.path.join("models", "cnn_model.keras") if os.path.exists(os.path.join("models", "cnn_model.keras")) else "cnn_model.keras",
    "MobileNetV2": os.path.join("models", "model_cardiomegaly_transfer_finetuned.keras") if os.path.exists(os.path.join("models", "model_cardiomegaly_transfer_finetuned.keras")) else "model_cardiomegaly_transfer_finetuned.keras",
}


def generate_gradcam(model, img_array, last_conv_layer_name=None):
    """Generate Grad-CAM heatmap untuk satu gambar."""
    # Cari layer konvolusi terakhir jika tidak dispesifikasikan
    if last_conv_layer_name is None:
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_layer_name = layer.name
                break

    if last_conv_layer_name is None:
        # Untuk model transfer learning, cari di sub-layers
        for layer in reversed(model.layers):
            if hasattr(layer, "layers"):
                for sub in reversed(layer.layers):
                    if isinstance(sub, tf.keras.layers.Conv2D):
                        last_conv_layer_name = sub.name
                        break
            if last_conv_layer_name:
                break

    try:
        grad_model = Model(
            [model.inputs],
            [model.get_layer(last_conv_layer_name).output, model.output],
        )
    except ValueError:
        return None

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = predictions[:, 0]

    grads = tape.gradient(loss, conv_outputs)
    if grads is None:
        return None

    weights = tf.reduce_mean(grads, axis=(1, 2))
    cam = tf.reduce_sum(
        tf.multiply(weights[:, tf.newaxis, tf.newaxis, :], conv_outputs), axis=-1
    )

    heatmap = cam[0].numpy()
    heatmap = np.maximum(heatmap, 0)
    if np.max(heatmap) != 0:
        heatmap /= np.max(heatmap)

    return heatmap


def analyze_model(model_name, model_path):
    """Jalankan analisis error lengkap untuk satu model."""
    print(f"\n{'='*60}")
    print(f"  ANALISIS ERROR: {model_name}")
    print(f"{'='*60}")

    if not os.path.exists(model_path):
        print(f"  Model tidak ditemukan: {model_path}")
        return

    model = load_model(model_path, compile=False)

    test_datagen = ImageDataGenerator(rescale=1.0 / 255)
    test_generator = test_datagen.flow_from_directory(
        "test",
        target_size=(IMG_SIZE, IMG_SIZE),
        color_mode="rgb",
        batch_size=BATCH_SIZE,
        class_mode="binary",
        shuffle=False,
    )

    # Prediksi
    predictions_raw = model.predict(test_generator, verbose=0)
    y_pred_prob = predictions_raw.reshape(-1)
    y_pred = (y_pred_prob > 0.5).astype(int)
    y_true = test_generator.classes
    filenames = test_generator.filenames

    # Classification report
    print("\n📊 Classification Report:")
    print(classification_report(y_true, y_pred, target_names=CLASS_NAMES))

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    print("📋 Confusion Matrix:")
    print(cm)

    # ==========================
    # 1. IDENTIFIKASI MISCLASSIFIED
    # ==========================
    misclassified_idx = np.where(y_pred != y_true)[0]
    correct_idx = np.where(y_pred == y_true)[0]

    total = len(y_true)
    n_errors = len(misclassified_idx)
    accuracy = len(correct_idx) / total * 100

    print(f"\n🔍 Total sampel test  : {total}")
    print(f"   Benar              : {len(correct_idx)} ({accuracy:.1f}%)")
    print(f"   Salah              : {n_errors} ({100 - accuracy:.1f}%)")

    # Breakdown error per kelas
    false_positives = np.where((y_pred == 1) & (y_true == 0))[0]
    false_negatives = np.where((y_pred == 0) & (y_true == 1))[0]

    print(f"\n   False Positives (Normal → Cardiomegaly) : {len(false_positives)}")
    print(f"   False Negatives (Cardiomegaly → Normal) : {len(false_negatives)}")

    # ==========================
    # 2. DISTRIBUSI CONFIDENCE ERROR
    # ==========================
    if n_errors > 0:
        error_confidences = []
        for idx in misclassified_idx:
            prob = y_pred_prob[idx]
            conf = prob if prob > 0.5 else 1 - prob
            error_confidences.append(conf * 100)

        fig, axes = plt.subplots(1, 2, figsize=(10, 4))

        # Histogram confidence untuk error
        axes[0].hist(error_confidences, bins=20, color="#d68768", edgecolor="white",
                     alpha=0.85)
        axes[0].set_xlabel("Confidence (%)")
        axes[0].set_ylabel("Jumlah Sampel")
        axes[0].set_title(f"Distribusi Confidence - Misclassified\n({model_name})")
        axes[0].axvline(x=np.mean(error_confidences), color="red", linestyle="--",
                        label=f"Mean: {np.mean(error_confidences):.1f}%")
        axes[0].legend()

        # Confidence distribution: correct vs incorrect
        correct_confidences = []
        for idx in correct_idx:
            prob = y_pred_prob[idx]
            conf = prob if prob > 0.5 else 1 - prob
            correct_confidences.append(conf * 100)

        axes[1].hist(correct_confidences, bins=30, alpha=0.6, label="Benar",
                     color="#476b57")
        axes[1].hist(error_confidences, bins=30, alpha=0.6, label="Salah",
                     color="#d68768")
        axes[1].set_xlabel("Confidence (%)")
        axes[1].set_ylabel("Jumlah Sampel")
        axes[1].set_title(f"Perbandingan Confidence\n({model_name})")
        axes[1].legend()

        plt.tight_layout()
        fig_path = os.path.join(OUTPUT_DIR, f"error_confidence_{model_name}.png")
        plt.savefig(fig_path, dpi=300)
        plt.close()
        print(f"\n📈 Grafik confidence disimpan: {fig_path}")

    # ==========================
    # 3. TAMPILKAN TOP MISCLASSIFIED + GRAD-CAM
    # ==========================
    if n_errors > 0:
        # Sortir berdasarkan confidence tertinggi (paling "yakin tapi salah")
        error_with_conf = []
        for idx in misclassified_idx:
            prob = y_pred_prob[idx]
            conf = prob if prob > 0.5 else 1 - prob
            error_with_conf.append((idx, conf, prob))

        error_with_conf.sort(key=lambda x: x[1], reverse=True)

        n_show = min(8, n_errors)
        fig, axes = plt.subplots(2, n_show, figsize=(3 * n_show, 6))
        if n_show == 1:
            axes = axes.reshape(2, 1)

        print(f"\n🖼️  Top {n_show} kesalahan (confidence tertinggi):")

        for i, (idx, conf, prob) in enumerate(error_with_conf[:n_show]):
            filepath = os.path.join("test", filenames[idx])
            true_label = CLASS_NAMES[y_true[idx]]
            pred_label = CLASS_NAMES[y_pred[idx]]

            print(f"   {i+1}. {filenames[idx]}")
            print(f"      True: {true_label} | Pred: {pred_label} | Conf: {conf*100:.1f}%")

            # Load dan tampilkan gambar asli
            img = cv2.imread(filepath)
            if img is None:
                continue
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            axes[0, i].imshow(img_rgb)
            axes[0, i].set_title(
                f"True: {true_label}\nPred: {pred_label}\n{conf*100:.1f}%",
                fontsize=8,
            )
            axes[0, i].axis("off")

            # Grad-CAM
            img_resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))
            img_array = np.expand_dims(img_resized / 255.0, axis=0).astype(
                np.float32
            )

            heatmap = generate_gradcam(model, img_array)
            if heatmap is not None:
                heatmap_resized = cv2.resize(
                    heatmap, (img_rgb.shape[1], img_rgb.shape[0])
                )
                heatmap_uint8 = np.uint8(255 * heatmap_resized)
                heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
                overlay = cv2.addWeighted(img, 0.7, heatmap_color, 0.4, 0)
                axes[1, i].imshow(cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB))
            else:
                axes[1, i].imshow(img_rgb)

            axes[1, i].set_title("Grad-CAM", fontsize=8)
            axes[1, i].axis("off")

        plt.suptitle(
            f"Analisis Error - {model_name}\n(Baris 1: Asli, Baris 2: Grad-CAM)",
            fontsize=11,
            fontweight="bold",
        )
        plt.tight_layout()
        fig_path = os.path.join(OUTPUT_DIR, f"top_errors_{model_name}.png")
        plt.savefig(fig_path, dpi=300, bbox_inches="tight")
        plt.close()
        print(f"\n🖼️  Visualisasi error disimpan: {fig_path}")

    # ==========================
    # 4. SIMPAN LAPORAN
    # ==========================
    report_path = os.path.join(OUTPUT_DIR, f"report_{model_name}.txt")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(f"LAPORAN ANALISIS ERROR - {model_name}\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Total sampel test : {total}\n")
        f.write(f"Akurasi           : {accuracy:.2f}%\n")
        f.write(f"Total error       : {n_errors}\n")
        f.write(f"False Positives   : {len(false_positives)}\n")
        f.write(f"False Negatives   : {len(false_negatives)}\n\n")
        f.write("Classification Report:\n")
        f.write(classification_report(y_true, y_pred, target_names=CLASS_NAMES))
        f.write(f"\nConfusion Matrix:\n{cm}\n\n")

        if n_errors > 0:
            f.write("Daftar file misclassified:\n")
            for idx, conf, prob in error_with_conf:
                true_label = CLASS_NAMES[y_true[idx]]
                pred_label = CLASS_NAMES[y_pred[idx]]
                f.write(
                    f"  {filenames[idx]} | True: {true_label} | "
                    f"Pred: {pred_label} | Conf: {conf*100:.1f}%\n"
                )

    print(f"\n📄 Laporan disimpan: {report_path}")


# ======================
# MAIN
# ======================
if __name__ == "__main__":
    for name, path in MODELS.items():
        analyze_model(name, path)

    print(f"\n{'='*60}")
    print(f"  SEMUA ANALISIS SELESAI")
    print(f"  Output di folder: {OUTPUT_DIR}/")
    print(f"{'='*60}")
