import cv2
import numpy as np
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt
import os

IMG_SIZE = 160

model = load_model("model_cardiomegaly_transfer_finetuned.keras")

image_path = r"testing/tes6.png"

if not os.path.exists(image_path):
    print("File gambar tidak ditemukan!")
    exit()

# Baca gambar RGB (bukan grayscale)
img = cv2.imread(image_path)
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

img_resized = cv2.resize(img, (IMG_SIZE, IMG_SIZE))

img_array = img_resized / 255.0
img_array = np.expand_dims(img_array, axis=0)

prediction = model.predict(img_array, verbose=0)[0][0]

if prediction > 0.5:
    result = "Cardiomegaly (Pembesaran Jantung)"
    confidence = prediction * 100
else:
    result = "Normal"
    confidence = (1 - prediction) * 100

print("Hasil:", result)
print("Confidence: %.2f%%" % confidence)

plt.imshow(img)
plt.title(f"{result} ({confidence:.2f}%)")
plt.axis("off")
plt.show()
