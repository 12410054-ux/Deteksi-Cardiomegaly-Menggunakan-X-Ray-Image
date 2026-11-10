"""Hyperparameter tuning untuk model CNN menggunakan Keras Tuner.

Mencari kombinasi terbaik dari:
  - Jumlah filter tiap Conv block
  - Jumlah unit Dense
  - Dropout rate
  - Learning rate

Jalankan:
    python hyperparameter_tuning.py

Hasil tuning disimpan di folder `tuning_results/`.
Model terbaik disimpan sebagai `cnn_model_tuned.keras`.
"""

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.preprocessing.image import ImageDataGenerator

try:
    import keras_tuner as kt
except ImportError:
    raise ImportError(
        "keras-tuner belum terinstall. Jalankan:\n"
        "  pip install keras-tuner\n"
    )

IMG_SIZE = 160
BATCH_SIZE = 16
MAX_TRIALS = 20
EPOCHS = 15

train_dir = "train"
test_dir = "test"

# ======================
# DATA GENERATOR
# ======================
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=5,
    zoom_range=0.05,
    horizontal_flip=True,
)

test_datagen = ImageDataGenerator(rescale=1.0 / 255)

train_generator = train_datagen.flow_from_directory(
    train_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode="rgb",
    batch_size=BATCH_SIZE,
    class_mode="binary",
)

validation_generator = test_datagen.flow_from_directory(
    test_dir,
    target_size=(IMG_SIZE, IMG_SIZE),
    color_mode="rgb",
    batch_size=BATCH_SIZE,
    class_mode="binary",
)


# ======================
# MODEL BUILDER (untuk Keras Tuner)
# ======================
def build_model(hp):
    """Membangun model CNN dengan hyperparameter yang bisa di-tune."""
    model = Sequential()

    # Conv Block 1
    filters_1 = hp.Choice("filters_1", values=[16, 32, 64], default=32)
    model.add(
        Conv2D(filters_1, (3, 3), activation="relu",
               input_shape=(IMG_SIZE, IMG_SIZE, 3))
    )
    model.add(MaxPooling2D(2, 2))

    # Conv Block 2
    filters_2 = hp.Choice("filters_2", values=[32, 64, 128], default=64)
    model.add(Conv2D(filters_2, (3, 3), activation="relu"))
    model.add(MaxPooling2D(2, 2))

    # Conv Block 3
    filters_3 = hp.Choice("filters_3", values=[64, 128, 256], default=128)
    model.add(Conv2D(filters_3, (3, 3), activation="relu"))
    model.add(MaxPooling2D(2, 2))

    # Conv Block 4 (opsional)
    use_block4 = hp.Boolean("use_block4", default=True)
    if use_block4:
        filters_4 = hp.Choice("filters_4", values=[128, 256, 512], default=256)
        model.add(Conv2D(filters_4, (3, 3), activation="relu"))
        model.add(MaxPooling2D(2, 2))

    # Fully Connected
    model.add(Flatten())

    dense_units = hp.Choice("dense_units", values=[64, 128, 256], default=128)
    model.add(Dense(dense_units, activation="relu"))

    dropout_rate = hp.Float("dropout_rate", min_value=0.3, max_value=0.7, step=0.1,
                            default=0.5)
    model.add(Dropout(dropout_rate))

    model.add(Dense(1, activation="sigmoid"))

    # Learning rate
    learning_rate = hp.Choice(
        "learning_rate", values=[1e-3, 5e-4, 1e-4, 5e-5], default=1e-4
    )

    model.compile(
        optimizer=Adam(learning_rate=learning_rate),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )

    return model


# ======================
# TUNER
# ======================
tuner = kt.BayesianOptimization(
    build_model,
    objective="val_accuracy",
    max_trials=MAX_TRIALS,
    seed=42,
    directory="tuning_results",
    project_name="cnn_cardiomegaly",
    overwrite=True,
)

early_stop = EarlyStopping(
    monitor="val_loss", patience=4, restore_best_weights=True
)

print("=" * 50)
print("MULAI HYPERPARAMETER TUNING")
print(f"Jumlah trial: {MAX_TRIALS}")
print(f"Epochs per trial: {EPOCHS}")
print("=" * 50)

tuner.search(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=[early_stop],
    verbose=1,
)

# ======================
# HASIL TERBAIK
# ======================
print("\n" + "=" * 50)
print("HASIL TUNING TERBAIK")
print("=" * 50)

best_hps = tuner.get_best_hyperparameters(num_trials=1)[0]

print(f"  Filters Block 1 : {best_hps.get('filters_1')}")
print(f"  Filters Block 2 : {best_hps.get('filters_2')}")
print(f"  Filters Block 3 : {best_hps.get('filters_3')}")
print(f"  Use Block 4     : {best_hps.get('use_block4')}")
if best_hps.get("use_block4"):
    print(f"  Filters Block 4 : {best_hps.get('filters_4')}")
print(f"  Dense Units     : {best_hps.get('dense_units')}")
print(f"  Dropout Rate    : {best_hps.get('dropout_rate')}")
print(f"  Learning Rate   : {best_hps.get('learning_rate')}")

# ======================
# RETRAIN MODEL TERBAIK
# ======================
print("\nMelatih ulang model terbaik...")

best_model = tuner.hypermodel.build(best_hps)

history = best_model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=[early_stop],
)

# Evaluasi
val_loss, val_acc = best_model.evaluate(validation_generator)
print(f"\nValidation Accuracy (model terbaik): {val_acc:.4f}")
print(f"Validation Loss    (model terbaik): {val_loss:.4f}")

# Simpan
best_model.save("cnn_model_tuned.keras")
print("\nModel terbaik disimpan sebagai 'cnn_model_tuned.keras'")

# Ringkasan semua trial
print("\n" + "=" * 50)
print("RINGKASAN SEMUA TRIAL")
print("=" * 50)
tuner.results_summary(num_trials=5)
