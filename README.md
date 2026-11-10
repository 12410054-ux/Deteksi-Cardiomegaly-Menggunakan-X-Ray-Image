# 🫁 Ruang Rontgen — AI Prediksi Kardiomegali

Aplikasi web berbasis AI untuk memprediksi **Kardiomegali (pembesaran jantung)** dari citra rontgen dada (Chest X-Ray) menggunakan model Deep Learning.

> ⚠️ **Disclaimer:** Aplikasi ini merupakan prototipe penelitian untuk tujuan edukasi. Bukan perangkat diagnosis medis dan tidak boleh digunakan sebagai pengganti penilaian dokter.

---

## 📋 Deskripsi Project

| Item | Detail |
|------|--------|
| **Masalah** | Klasifikasi biner citra X-ray dada: Normal vs Kardiomegali |
| **Dataset** | 2.220 train + 557 test per kelas (total 5.554 gambar, seimbang) |
| **Model 1** | CNN custom 4-block (Conv2D 32→64→128→256) |
| **Model 2** | MobileNetV2 fine-tuned (30 layer terakhir di-unfreeze) |
| **Backend** | Flask (Python) dengan endpoint `/predict` |
| **Frontend** | HTML/CSS/JS responsif dengan drag-and-drop upload |
| **Explainability** | Grad-CAM visualization |

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐     POST /predict      ┌──────────────────────┐
│                  │  ───────────────────►  │   Flask Backend      │
│   Browser        │                        │   (app.py)           │
│   - Upload X-ray │  ◄───────────────────  │   - Load model       │
│   - Pilih model  │     JSON response      │   - Preprocess image │
│   - Lihat hasil  │                        │   - Run inference    │
└─────────────────┘                        └──────────┬───────────┘
                                                       │
                                           ┌───────────┴───────────┐
                                           │                       │
                                    ┌──────┴──────┐    ┌───────────┴──────┐
                                    │ CNN Model   │    │ MobileNetV2      │
                                    │ (.keras)    │    │ Fine-tuned       │
                                    └─────────────┘    │ (.keras)         │
                                                       └──────────────────┘
```

## 🚀 Cara Menjalankan (Lokal)

### Prasyarat
- Python 3.10 atau 3.11
- pip

### Instalasi

```powershell
# Clone / masuk ke folder project
cd "d:\project X-ray jantung1\project X-ray jantung"

# Buat virtual environment
py -m venv .venv
.venv\Scripts\Activate.ps1

# Install dependensi
py -m pip install -r requirements.txt

# Jalankan aplikasi
py app.py
```

Buka **http://127.0.0.1:5000** di browser.

### Cara Penggunaan
1. Buka halaman web
2. Upload gambar rontgen dada (PNG, JPG, JPEG, atau WEBP, maks 10 MB)
3. Pilih model (MobileNetV2 Fine-tuned atau CNN)
4. Klik **"Analisis citra"**
5. Lihat hasil: label prediksi, confidence, dan probabilitas per kelas

## 📊 Evaluasi Model

Script evaluasi tersedia untuk kedua model:

```bash
# Evaluasi CNN
python evaluasi_cnn.py

# Evaluasi MobileNetV2
python evaluasi_transfer.py

# Perbandingan ROC kedua model
python duamodel.py

# Analisis error + Grad-CAM sampel misclassified
python error_analysis.py
```

Output evaluasi meliputi:
- Classification Report (Precision, Recall, F1-Score)
- Confusion Matrix (visual, IEEE-ready)
- ROC Curve + AUC Score
- Error Analysis dengan Grad-CAM

## 🔧 Hyperparameter Tuning

```bash
python hyperparameter_tuning.py
```

Menggunakan **Keras Tuner (Bayesian Optimization)** untuk mencari kombinasi terbaik:
- Jumlah filter Conv2D per block
- Unit Dense layer
- Dropout rate
- Learning rate

Hasil tuning disimpan di `tuning_results/`, model terbaik disimpan sebagai `cnn_model_tuned.keras`.

## 🧠 Explainability (Grad-CAM)

```bash
python gradcame_transfer.py
```

Menggunakan Grad-CAM untuk memvisualisasikan area pada citra rontgen yang paling berpengaruh terhadap prediksi model. Script ini menerapkan prinsip OOP:
- **Abstraction**: Base class `MedicalImageClassifier`
- **Encapsulation**: Private attributes dengan property
- **Inheritance**: `CardiomegalyClassifier` extends base class
- **Polymorphism**: Override method `predict()` dan `generate_gradcam()`

## 🌐 Deployment

### Render

1. Push project ke GitHub (pastikan `.gitignore` aktif)
2. Buat **New Web Service** di [render.com](https://render.com)
3. Hubungkan repo GitHub
4. Render akan otomatis mendeteksi `render.yaml`

### Docker

```bash
docker build -t ruang-rontgen .
docker run -p 5000:5000 ruang-rontgen
```

### Railway

1. Push ke GitHub
2. Buat project baru di [railway.app](https://railway.app)
3. Railway akan mendeteksi `Procfile` secara otomatis

## 📁 Struktur Folder

```
project X-ray jantung/
├── app.py                      # Flask web server + /predict endpoint
├── test_app.py                 # Automated testing suite
├── train_cnn.py                # Training model CNN
├── train_transfer.py           # Training model MobileNetV2 (Transfer Learning)
├── evaluasi_cnn.py             # Evaluasi model CNN
├── evaluasi_transfer.py        # Evaluasi model MobileNetV2
├── duamodel.py                 # Perbandingan ROC kedua model
├── predict.py                  # Prediksi single image (CLI)
├── gradcame_transfer.py        # Grad-CAM + OOP
├── hyperparameter_tuning.py    # Hyperparameter tuning (Keras Tuner)
├── error_analysis.py           # Analisis error + Grad-CAM misclassified
├── data.py                     # Hitung data per kelas
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker deployment
├── Procfile                    # Railway/Render deployment
├── render.yaml                 # Render Blueprint
├── runtime.txt                 # Python version (Render)
├── .gitignore
├── README.md
├── models/                     # Tempat model Deep Learning terlatih (.keras)
│   ├── model_cardiomegaly_transfer_finetuned.keras  # MobileNetV2 (~24 MB) - Model Utama
│   └── cnn_model.keras                              # CNN Custom (~30 MB) - Baseline
├── evaluation_reports/         # Hasil evaluasi visual (ROC curve, Confusion Matrix)
│   ├── confusion_matrix_cnn.png
│   ├── confusion_matrix_mobilenetv2.png
│   ├── roc_comparison.png
│   ├── roc_curve_CNN.png
│   └── roc_curve_mobilenetv2.png
├── static/
│   ├── style.css               # Styling
│   ├── app.js                  # Frontend logic
│   └── uploads/                # Direktori upload citra sementara
├── templates/
│   └── index.html              # Halaman web utama
├── train/                      # Dataset training
│   ├── Cardiomegaly/ (2220)
│   └── Normal/ (2220)
├── test/                       # Dataset testing
│   ├── Cardiomegaly/ (557)
│   └── Normal/ (557)
└── testing/                    # Sampel citra untuk uji manual
```

## 🛠️ Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Bahasa | Python 3.11 |
| Deep Learning | TensorFlow / Keras |
| Web Framework | Flask |
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Visualisasi | Matplotlib, Seaborn |
| ML Metrics | scikit-learn |
| Explainability | Grad-CAM (custom implementation) |
| HP Tuning | Keras Tuner |
| Image Processing | Pillow, OpenCV |
| Deployment | Docker, Render, Railway |

## 📜 Lisensi

Project ini dibuat untuk keperluan penelitian dan edukasi.

---

*Dibuat dengan ❤️ untuk penelitian AI di bidang radiologi — 2026*
