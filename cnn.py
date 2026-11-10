from tensorflow.keras.models import load_model

model = load_model("cnn_model.keras")
model.summary()