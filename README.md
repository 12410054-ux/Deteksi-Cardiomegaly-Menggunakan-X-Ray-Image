# 🫁 Ruang Rontgen — Sistem Deteksi Kardiomegali Berbasis AI (Custom CNN)

Aplikasi web cerdas untuk mendeteksi indikasi **Kardiomegali (Pembesaran Jantung)** dari citra radiografi toraks (*Chest X-Ray*) menggunakan model **Convolutional Neural Network (CNN)** kustom. Sistem dilengkapi antarmuka klinis modern dan validasi otomatis citra medis.

> ⚠️ **Disclaimer Medis:** Aplikasi ini merupakan prototipe penelitian akademik dan alat bantu edukasi (*clinical decision-support tool*). Sistem ini bukan pengganti pertimbangan klinis profesional dari Dokter Spesialis Jantung atau Radiolog.

---

## 📋 Ringkasan Eksekutif & Spesifikasi Teknis

| Parameter | Spesifikasi |
|---|---|
| **Domain** | Radiologi Dada Medis (*Thoracic Radiology AI*) |
| **Tugas Pembelajaran Mesin** | Klasifikasi Biner Citra: **Kardiomegali** vs **Normal** |
| **Model Utama Sistem** | **Custom CNN (4-Block Convolutional Architecture)** (~2.485.825 parameter) |
| **Model Pembanding (Benchmark)**| MobileNetV2 Transfer Learning (hanya sebagai baseline penelitian komparatif) |
| **Dataset Training** | 4.440 citra seimbang (2.220 Kardiomegali + 2.220 Normal) |
| **Dataset Testing** | 1.114 citra seimbang (557 Kardiomegali + 557 Normal) |
| **Resolusi Input Model** | $160 \times 160$ piksel, 3-Kanal RGB, Normalisasi $[0.0, 1.0]$ |
| **Backend & WSGI** | Python 3.11 / 3.12, **Flask 3.0**, Gunicorn |
| **Deep Learning Engine** | **TensorFlow 2.x / Keras**, Scikit-Learn, OpenCV, Pillow |
| **Frontend UI** | Semantik HTML5, Modern Responsive CSS3, Vanilla JavaScript (Fetch API) |
| **Pengujian Terotomatisasi**| Unit & Integration Test (`test_app.py`) — **60/60 PASSED** |

---

## 🏗️ Arsitektur Alur Komunikasi & Pengolahan Data

### 1. Diagram Komunikasi Frontend ⇄ Backend
```text
┌─────────────────────────────────┐
│     PENGGUNA / BROWSER          │
│  - Drag & drop citra X-ray      │
│  - Pratinjau gambar di layar    │
│  - Klik tombol "Analisis Citra" │
└────────────────┬────────────────┘
                 │
                 │ 1. HTTP POST /predict (multipart/form-data)
                 ▼
┌───────────────────────────────────────────────────────────────┐
│     BACKEND FLASK (app.py)                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 2. Validasi Integritas Citra Medis:                     │  │
│  │    - Ekstensi (.png, .jpg, .jpeg, .webp) & Ukuran (<10MB│  │
│  │    - Aspek Rasio Siluet Toraks (0.45 s/d 2.2)           │  │
│  │    - Deviasi Warna RGB (Mencegah foto berwarna/selfie)  │  │
│  │    - Kontras & Intensitas Pencahayaan                   │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │ Citra Valid                     │
│                             ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 3. Preprocessing Citra:                                 │  │
│  │    - Resize (160, 160) dg Interpolasi NEAREST           │  │
│  │    - Normalisasi Nilai Piksel: Array / 255.0            │  │
│  │    - Expand Dimensi Batch: (1, 160, 160, 3)             │  │
│  └──────────────────────────┬──────────────────────────────┘  │
│                             │ Batch Array                     │
│                             ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 4. Inferensi Model Custom CNN:                          │  │
│  │    - Forward pass ke cnn_model.keras                    │  │
│  │    - Output Sigmoid: P(Normal)                          │  │
│  │    - Probabilitas Kardiomegali = 1.0 - P(Normal)        │  │
│  │    - Klasifikasi: Positif jika P(Kardiomegali) >= 0.50   │  │
│  │    - Generate Catatan Klinis & Status UI                │  │
│  └──────────────────────────┬──────────────────────────────┘  │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                              │ 5. Response JSON (label, confidence, probabilitas, URL gambar)
                              ▼
┌───────────────────────────────────────────────────────────────┐
│     TAMPILAN HASIL (static/app.js)                            │
│  - Render Label ("Kardiomegali" / "Normal")                   │
│  - Render Bar Persentase Keyakinan                            │
│  - Tampilkan Catatan Rekomendasi Klinis                       │
└───────────────────────────────────────────────────────────────┘
```

### 2. Rumus Matematika Perhitungan Probabilitas
Model dilatih menggunakan `ImageDataGenerator` Keras di mana urutan label kelas diurutkan secara alfabetis:
- **Indeks 0**: `Cardiomegaly`
- **Indeks 1**: `Normal`

Output layer terakhir model CNN menggunakan fungsi aktivasi **Sigmoid** dengan fungsi *loss* `binary_crossentropy`, yang menghasilkan nilai tunggal $\hat{y} \in [0, 1]$ yang merepresentasikan probabilitas kelas berindeks 1 ($P(\text{Normal})$).

Maka probabilitas Kardiomegali dihitung dengan komplemennya:
$$P(\text{Normal}) = \hat{y}$$
$$P(\text{Kardiomegali}) = 1.0 - P(\text{Normal})$$

Jika $P(\text{Kardiomegali}) \ge 0.50$, sistem menyimpulkan indikasi **Kardiomegali** dengan persentase keyakinan $P(\text{Kardiomegali}) \times 100\%$.

---

## 📁 Struktur Folder & File Terorganisir

Project ini telah dirapikan ke dalam struktur modular berbasis tanggung jawab (*Separation of Concerns*):

```text
project X-ray jantung/
├── docs/                           # Seluruh dokumentasi akademik & presentasi
│   ├── reports/                    # Laporan resmi mingguan & black box testing (.docx)
│   ├── presentations/              # Slide dek presentasi sidang / kuliah (.pptx)
│   └── manuscript/                 # Naskah manuskrip artikel ilmiah & generator paper
│
├── ml_pipeline/                    # Modul Inti Machine Learning
│   ├── training/                   # Script pelatihan model & pencarian hyperparameter
│   │   ├── train_cnn.py            # [UTAMA] Pelatihan model CNN Custom 4-Block
│   │   ├── train_transfer.py       # [PEMBANDING] Pelatihan MobileNetV2 benchmark
│   │   └── hyperparameter_tuning.py# Tuning filter/dense/dropout dengan Keras Tuner
│   ├── evaluation/                 # Script metrik pengujian & analisis visual
│   │   ├── evaluasi_cnn.py         # Evaluasi lengkap CNN (Confusion Matrix, ROC, AUC)
│   │   ├── evaluasi_transfer.py    # Evaluasi MobileNetV2 (untuk perbandingan)
│   │   ├── duamodel.py             # Plot perbandingan ROC CNN vs MobileNetV2 (IEEE Style)
│   │   ├── class_report.py         # Classification Report scikit-learn
│   │   └── error_analysis.py       # Analisis distribusi error pada sampel salah
│   └── utils/                      # Utilitas pendukung
│       ├── data.py                 # Verifikasi jumlah persebaran dataset per kelas
│       ├── validator.py            # [BARU] Sistem Validasi Multi-Tahap Citra Radiografi
│       └── predict.py              # Script inferensi mandiri lewat terminal (CLI)
│
├── validator.py                    # [BARU] Entrypoint proxy sistem validasi citra
├── models/                         # Berkas biner model deep learning terlatih (.keras)
│   ├── cnn_model.keras             # Model Utama: Custom CNN 4-Block (~29.8 MB)
│   └── model_cardiomegaly_transfer_finetuned.keras # Model Pembanding (~23.8 MB)
│
├── tools/                          # Utilitas remote tunneling untuk demo publik
│   ├── run_online.py               # Peluncur server lokal + Localtunnel publik
│   ├── run_with_ngrok.py           # Peluncur server lokal + pyngrok
│   └── start_ngrok.js              # Peluncur server aman via @ngrok/ngrok
│
├── static/                         # Aset statis antarmuka web
│   ├── style.css                   # Lembar gaya CSS (desain klinis/modern)
│   ├── app.js                      # Interaktivitas DOM, Fetch API, drag-and-drop
│   └── uploads/                    # Folder penampung citra sementara saat inferensi (.gitkeep)
│
├── templates/                      # Template antarmuka web
│   └── index.html                  # Halaman web klinis responsif (Jinja2)
│
├── evaluation_reports/             # Laporan visual grafis (Confusion Matrix, ROC Curves)
├── testing/                        # Sampel citra rontgen siap uji untuk demonstrasi
├── train/ & test/                  # Dataset radiologi toraks dada (Cardiomegaly & Normal)
│
├── app.py                          # Server backend utama (Flask API)
├── test_app.py                     # Suite pengujian otomatis (60 skenario uji)
├── requirements.txt                # Daftar paket dependensi Python
├── Dockerfile                      # Konfigurasi containerisasi Docker
├── Procfile & render.yaml          # Konfigurasi deployment cloud (Render / Railway)
├── runtime.txt                     # Versi runtime Python (python-3.11.9)
├── .env.example                    # Template variabel lingkungan aman
├── .gitignore & .dockerignore      # Aturan filter repositori git & docker
├── jalankan_online.bat             # Shortcut 1-klik untuk menjalankan demo publik online
└── jalankan_ngrok.bat              # Shortcut 1-klik untuk menjalankan via ngrok
```

> **Catatan Kompatibilitas:** Di root folder tersedia *entrypoint wrapper* untuk berkas-berkas runner seperti `train_cnn.py`, `evaluasi_cnn.py`, `predict.py`, dan `data.py` sehingga perintah terminal yang dipanggil dari root tetap berjalan mulus.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Mode Lokal (Laptop / Komputer Sendiri)

Pastikan lingkungan virtual environment Python sudah terpasang:

```powershell
# 1. Masuk ke folder project
cd "d:\project X-ray jantung1\project X-ray jantung"

# 2. Jalankan server Flask
.\.venv\Scripts\python.exe app.py
```
Buka browser dan akses alamat: **`http://127.0.0.1:5000`**

---

### 2. Mode Online / Demonstrasi Sidang (Bisa Dibuka di HP Dosen)

Tersedia skrip instan otomatis:
- **Opsi A (Localtunnel - Tanpa Perlu Daftar/Token):**
  Cukup klik ganda berkas **`jalankan_online.bat`**. Terminal akan menyalakan server Flask dan memunculkan URL HTTPS publik yang bisa dibuka di HP siapa saja.
- **Opsi B (Ngrok):**
  Cukup klik ganda berkas **`jalankan_ngrok.bat`**. Pastikan token ngrok Anda sudah diisi di berkas `.env`.

---

### 3. Menjalankan Suite Pengujian Otomatis

Untuk membuktikan kestabilan seluruh sistem sebelum presentasi:

```powershell
.\.venv\Scripts\python.exe test_app.py
```
> Hasil pengujian: **75/75 PASSED (0 FAILED)** meliputi uji modul, pemuatan model CNN, prediksi citra normal, prediksi citra kardiomegali, penolakan foto berwarna, penolakan dokumen scan, penolakan gambar polos/noise, error handling, dan integritas berkas.

---

### 4. Menjalankan Prediksi Langsung lewat Terminal (CLI)

```powershell
# Prediksi citra sampel default
.\.venv\Scripts\python.exe predict.py

# Atau tentukan path citra sendiri
.\.venv\Scripts\python.exe predict.py testing/normal.png
```

---

## 🎓 PANDUAN MEMAHAMI STRUKTUR CODE UNTUK PRESENTASI

Bagian ini dirancang khusus agar Anda dapat menjelaskan kode dan arsitektur sistem secara meyakinkan di hadapan dosen penguji.

### A. Fungsi File-File Paling Penting

1. **`app.py` (Jantung Aplikasi Backend):**
   - Menginisialisasi aplikasi Flask.
   - Memuat model `cnn_model.keras` ke memori menggunakan TensorFlow/Keras.
   - Fungsi `validate_chest_xray()`: Bertindak sebagai "filter pengaman medis". Memeriksa apakah gambar yang diunggah benar-benar rontgen toraks grayscale atau bukan (mencegah gambar sembarang seperti foto selfie atau pemandangan diproses).
   - Fungsi `classify()`: Melakukan inferensi menggunakan model CNN dan menghitung probabilitas Kardiomegali.
   - Endpoint `/predict`: Menerima berkas dari browser, menjalankan validasi, memanggil inferensi, dan mengembalikan hasil dalam format JSON.

2. **`ml_pipeline/training/train_cnn.py` (Arsitektur Model CNN):**
   - Mendefinisikan arsitektur jaringan saraf konvolusi 4-blok:
     - **Block 1**: Conv2D (32 filter, kernel $3\times3$, ReLU) + MaxPooling2D ($2\times2$)
     - **Block 2**: Conv2D (64 filter, kernel $3\times3$, ReLU) + MaxPooling2D ($2\times2$)
     - **Block 3**: Conv2D (128 filter, kernel $3\times3$, ReLU) + MaxPooling2D ($2\times2$)
     - **Block 4**: Conv2D (256 filter, kernel $3\times3$, ReLU) + MaxPooling2D ($2\times2$)
     - **Classifier Head**: Flatten $\rightarrow$ Dense (128, ReLU) $\rightarrow$ Dropout (0.5) $\rightarrow$ Dense (1, Sigmoid).
   - Menggunakan optimizer Adam ($lr=10^{-4}$), loss `binary_crossentropy`, dan callback `EarlyStopping`.

3. **`ml_pipeline/evaluation/evaluasi_cnn.py` (Validasi Ilmiah):**
   - Menghitung akurasi, sensitivitas (*recall*), presisi, dan F1-Score pada data uji yang belum pernah dilihat model.
   - Membuat grafik Confusion Matrix dan kurva ROC (*Receiver Operating Characteristic*) beserta skor AUC (*Area Under Curve*).

4. **`static/app.js` & `templates/index.html` (Antarmuka Pengguna):**
   - Mengimplementasikan pengalaman pengguna interaktif (*asynchronous*) tanpa *reload* halaman menggunakan `fetch('/predict')`.

---

### B. Simulasi Tanya-Jawab dengan Dosen Penguji

#### ❓ Pertanyaan 1: "Mengapa Anda menggunakan model CNN Custom, dan mengapa MobileNetV2 tidak digunakan dalam sistem aplikasi?"
> **Jawaban yang Disarankan:**  
> *"Sistem ini secara khusus dirancang dan difokuskan pada model Custom CNN 4-Block. Alasan teknisnya adalah model Custom CNN memiliki arsitektur yang dirancang khusus dari nol (*from scratch*) sesuai domain citra rontgen toraks monokromatik dengan ukuran 160x160 piksel, sehingga memiliki performa yang sangat stabil tanpa beban parameter berlebih. Sementara itu, MobileNetV2 kami sertakan pada penelitian ini murni sebagai model pembanding (*benchmark*) untuk menganalisis performa Transfer Learning vs Custom CNN pada naskah evaluasi ilmiah kami."*

#### ❓ Pertanyaan 2: "Bagaimana cara model membedakan citra Normal dan Kardiomegali?"
> **Jawaban yang Disarankan:**  
> *"Melalui proses konvolusi berjenjang pada 4 blok CNN. Blok awal mendeteksi tepi (*edges*) dan batas tulang rusuk. Blok konvolusi yang lebih dalam mempelajari representasi rasio kardiotoraks (*Cardiothoracic Ratio* / CTR), yaitu perbandingan antara lebar siluet jantung terhadap lebar rongga dada bagian dalam. Jika siluet jantung melebihi 50% dari rongga toraks, model mendeteksi adanya pembesaran siluet yang mengindikasikan Kardiomegali."*

#### ❓ Pertanyaan 3: "Mengapa output probabilitas Kardiomegali dihitung dengan `1.0 - normal_probability`?"
> **Jawaban yang Disarankan:**  
> *"Secara bawaan, generator data Keras mengurutkan kelas berdasarkan abjad (alphabetical order). Karena 'Cardiomegaly' berawalan huruf C (indeks 0) dan 'Normal' berawalan huruf N (indeks 1), maka fungsi aktivasi Sigmoid di layer keluaran merepresentasikan probabilitas kelas 1, yaitu P(Normal). Dengan demikian, secara kaidah probabilitas biner, probabilitas terjadinya Kardiomegali adalah komplemennya, yaitu: $P(\text{Cardiomegaly}) = 1.0 - P(\text{Normal})$."*

#### ❓ Pertanyaan 4: "Bagaimana Anda memastikan sistem tidak menerima foto selfie, hewan, atau dokumen sembarangan?"
> **Jawaban yang Disarankan:**  
> *"Sistem kami mengimplementasikan **Sistem Validasi Multi-Tahap (Chest X-Ray Pre-Screening)** di modul `ml_pipeline/utils/validator.py` yang memvalidasi citra sebelum masuk ke inferensi model CNN:*
> 1. *Pemeriksaan Dimensi & Aspek Rasio (0.45 s/d 2.20) untuk memastikan proporsi foto toraks standar (PA/AP).*
> 2. *Pemeriksaan Monokromatisitas & Saturasi HSV: Sinar-X adalah radiasi monokromatik (skala abu-abu). Foto berwarna (selfie, hewan, mobil, pemandangan) langsung ditolak.*
> 3. *Pemeriksaan Latar Kertas Putih & Dokumen Teks: Menolak unggahan berkas dokumen, struk, atau resep yang memiliki latar belakang putih dominan (>240) dan sudut terang.*
> 4. *Pemeriksaan Kontras & Rentang Dinamis Jaringan: Menolak citra kosong/polos, overexposed, atau sketsa biner tanpa gradien jaringan lunak.*
> 5. *Analisis Kontur Tulang & Paru (Sobel Edge Gradient): Memastikan citra memiliki tekstur tepi anatomi rongga toraks.*
> 6. *Verifikasi Struktur Spasial Toraks: Memastikan densitas perifer/sudut luar (udara luar) tidak lebih terang dari kavitas toraks tengah.*
> *Jika salah satu tahap gagal, sistem menghentikan inferensi dan memberikan pesan peringatan edukatif kepada pengguna."*

#### ❓ Pertanyaan 5: "Bagaimana struktur kode Anda dipisahkan antara backend, frontend, dan machine learning?"
> **Jawaban yang Disarankan:**  
> *"Kami menerapkan prinsip Separation of Concerns: modul machine learning (pelatihan, evaluasi, dan tuning) kami isolasi di folder `ml_pipeline/`, aset dan logika frontend di folder `static/` dan `templates/`, dokumen laporan akademik di folder `docs/`, sedangkan berkas `app.py` di root murni bertindak sebagai REST controller dan gateway inferensi. Hal ini membuat arsitektur project sangat modular, bersih, dan mudah dipelihara."*

---

*Project Ruang Rontgen — Disiapkan untuk Keperluan Akademik & Penelitian Radiologi AI — 2026*
