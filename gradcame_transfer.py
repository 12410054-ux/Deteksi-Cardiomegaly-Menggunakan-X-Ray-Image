import tensorflow as tf
import numpy as np
import cv2
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from abc import ABC, abstractmethod


# =========================================================
# 1) ABSTRACTION + ENCAPSULATION
# Base class untuk image medical classifier
# =========================================================
class MedicalImageClassifier(ABC):
    def __init__(self, model_path: str, img_size: int = 160):
        self._model_path = model_path          # encapsulation
        self._img_size = img_size              # encapsulation
        self._model = load_model(model_path)   # encapsulation

    @property
    def model(self):
        return self._model

    @property
    def img_size(self):
        return self._img_size

    def preprocess_image(self, img_path: str):
        """Preprocessing umum."""
        img = image.load_img(img_path, target_size=(self._img_size, self._img_size))
        img_array = image.img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    @abstractmethod
    def predict(self, img_path: str):
        """Harus diimplementasikan oleh subclass."""
        pass

    @abstractmethod
    def generate_gradcam(self, img_path: str):
        """Harus diimplementasikan oleh subclass."""
        pass


# =========================================================
# 2) INHERITANCE+
# Class khusus untuk cardiomegaly
# =========================================================
class CardiomegalyClassifier(MedicalImageClassifier):
    def __init__(self,
                 model_path: str,
                 last_conv_layer_name: str = "Conv_1",
                 img_size: int = 160,
                 threshold: float = 0.75):
        super().__init__(model_path, img_size)
        self._last_conv_layer_name = last_conv_layer_name
        self._threshold = threshold

    def predict(self, img_path: str):
        """
        POLYMORPHISM:
        Method predict ini meng-override abstract method dari parent class.
        """
        img_array = self.preprocess_image(img_path)
        prediction = self.model.predict(img_array, verbose=0)[0][0]

        if prediction > 0.5:
            result = "Cardiomegaly (Pembesaran Jantung)"
            confidence = prediction * 100
        else:
            result = "Normal"
            confidence = (1 - prediction) * 100

        return {
            "result": result,
            "confidence": confidence,
            "raw_prediction": float(prediction)
        }

    def generate_gradcam(self, img_path: str):
        """
        POLYMORPHISM:
        Implementasi generate_gradcam khusus untuk model cardiomegaly.
        """
        img_array = self.preprocess_image(img_path)

        grad_model = tf.keras.models.Model(
            [self.model.inputs],
            [self.model.get_layer(self._last_conv_layer_name).output, self.model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            loss = predictions[:, 0]

        grads = tape.gradient(loss, conv_outputs)

        # Guided Grad-CAM
        guided_grads = (
            tf.cast(conv_outputs > 0, "float32") *
            tf.cast(grads > 0, "float32") *
            grads
        )

        weights = tf.reduce_mean(guided_grads, axis=(1, 2))
        cam = tf.reduce_sum(
            tf.multiply(weights[:, tf.newaxis, tf.newaxis, :], conv_outputs),
            axis=-1
        )

        heatmap = cam[0].numpy()
        heatmap = np.maximum(heatmap, 0)

        if np.max(heatmap) != 0:
            heatmap /= np.max(heatmap)

        # threshold agar lebih fokus
        heatmap[heatmap < self._threshold] = 0

        img_original = cv2.imread(img_path)
        heatmap = cv2.resize(heatmap, (img_original.shape[1], img_original.shape[0]))

        heatmap = np.uint8(255 * heatmap)
        heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        overlay = cv2.addWeighted(img_original, 0.7, heatmap_color, 0.4, 0)

        return img_original, overlay

    def display_result(self, img_path: str):
        prediction_result = self.predict(img_path)
        img_original, overlay = self.generate_gradcam(img_path)

        plt.figure(figsize=(10, 5))

        plt.subplot(1, 2, 1)
        plt.title("Original Image")
        plt.imshow(cv2.cvtColor(img_original, cv2.COLOR_BGR2RGB))
        plt.axis("off")

        plt.subplot(1, 2, 2)
        plt.title(f"{prediction_result['result']} ({prediction_result['confidence']:.2f}%)")
        plt.imshow(cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB))
        plt.axis("off")

        plt.tight_layout()
        plt.show()

        print("Hasil:", prediction_result["result"])
        print("Confidence: %.2f%%" % prediction_result["confidence"])


# =========================================================
# 3) Contoh subclass lain untuk menunjukkan polymorphism
# =========================================================
class PneumoniaClassifier(MedicalImageClassifier):
    def predict(self, img_path: str):
        img_array = self.preprocess_image(img_path)
        prediction = self.model.predict(img_array, verbose=0)[0][0]

        if prediction > 0.5:
            result = "Pneumonia"
            confidence = prediction * 100
        else:
            result = "Normal"
            confidence = (1 - prediction) * 100

        return {
            "result": result,
            "confidence": confidence,
            "raw_prediction": float(prediction)
        }

    def generate_gradcam(self, img_path: str):
        raise NotImplementedError("Grad-CAM untuk PneumoniaClassifier belum dibuat.")


# =========================================================
# MAIN
# =========================================================
if __name__ == "__main__":
    model_path = "model_cardiomegaly_transfer_finetuned.keras"
    img_path = "testing/tes9.png"

    classifier = CardiomegalyClassifier(
        model_path=model_path,
        last_conv_layer_name="Conv_1",
        img_size=160,
        threshold=0.75
    )

    classifier.display_result(img_path)