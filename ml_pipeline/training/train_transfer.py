"""Model Pembanding: Training MobileNetV2 Transfer Learning untuk analisis komparatif."""
import os
import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IMG_SIZE = 160
BATCH_SIZE = 16

train_dir = os.path.join(BASE_DIR, "train")
test_dir = os.path.join(BASE_DIR, "test")

# ======================
# DATA GENERATOR
# ======================
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=5,
    zoom_range=0.05,
    horizontal_flip=True
)

test_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode="rgb",
    batch_size=BATCH_SIZE,
    class_mode="binary"
)

validation_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode="rgb",
    batch_size=BATCH_SIZE,
    class_mode="binary"
)

# ======================
# BASE MODEL
# ======================
base_model = MobileNetV2(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

# Fine-tuning: buka sebagian layer akhir
base_model.trainable = True

for layer in base_model.layers[:-30]:
    layer.trainable = False

# ======================
# CUSTOM HEAD
# ======================
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.5)(x)
output = Dense(1, activation='sigmoid')(x)

model = Model(inputs=base_model.input, outputs=output)

model.compile(
    optimizer=Adam(learning_rate=0.00001),
    loss='binary_crossentropy',
    metrics=['accuracy']
)

early_stop = EarlyStopping(
    monitor='val_loss',
    patience=4,
    restore_best_weights=True
)

print("Mulai training Transfer Learning (Fine-Tuning)...")

model.fit(
    train_generator,
    epochs=15,
    validation_data=validation_generator,
    callbacks=[early_stop]
)

save_dir = os.path.join(BASE_DIR, "models")
os.makedirs(save_dir, exist_ok=True)
save_path = os.path.join(save_dir, "model_cardiomegaly_transfer_finetuned.keras")
model.save(save_path)

print(f"Model Pembanding Fine-Tuned berhasil disimpan ke '{save_path}'")
