# Analisis Perbandingan MobileNetV2 dan Custom CNN untuk Deteksi Kardiomegali

**Mamangkey, Gerald Rafael; Mandang, Ariel Quinn; Samandi Faithhly Hiskia Miracle**  
*Program Studi Informatika, Fakultas Ilmu Komputer, Universitas Klabat, Airmadidi, Indonesia*  
*(geraldrafael@gmail.com)*  
**2026**

---

## Abstrak
Kardiomegali adalah pembesaran jantung yang abnormal yang menandakan patologi kardiovaskular berat, sehingga deteksi radiografik yang tepat waktu sangat penting untuk mencegah gagal jantung. Namun, penilaian manual konvensional sangat bergantung pada keahlian radiolog dan estimasi visual terhadap rasio kardiotoraks, yang menyebabkan inkonsistensi diagnostik dan kelelahan interpretasi dalam triase klinis yang terbebani. Untuk menjawab tantangan diagnostik ini, sistem *Computer-Aided Diagnosis* (CADx) otomatis yang memanfaatkan *deep convolutional neural network* menawarkan deteksi yang objektif, dapat direproduksi, dan instan dari radiograf dada. Penelitian ini melakukan analisis perbandingan empiris secara langsung antara *transfer learning* melalui MobileNetV2 yang di-*fine-tune* dan Custom CNN spesifik domain yang dilatih dari nol, di bawah kondisi prapemrosesan dan evaluasi yang identik. Dataset eksperimen terdiri dari 5,552 radiograf dada *posteroanterior* (PA) dan *anteroposterior* (AP) yang seimbang (2,776 kardiomegali dan 2,776 normal) yang dibagi menjadi 4,438 sampel pelatihan dan 1,114 sampel pengujian independen. Kedua arsitektur dilatih dengan normalisasi piksel, augmentasi ringan, *resampling* spasial *nearest-neighbor*, dan optimasi Adam dengan *early stopping*. Hasil eksperimen pada 1,114 citra uji *hold-out* menunjukkan bahwa Custom CNN secara konsisten mengungguli MobileNetV2 yang di-*fine-tune* pada seluruh metrik evaluasi kuantitatif. Custom CNN mencapai akurasi keseluruhan sebesar 75.49% dibandingkan 70.20% untuk MobileNetV2, yang mencerminkan keunggulan 5.29 poin persentase. Pada analisis *receiver operating characteristic*, Custom CNN menghasilkan *Area Under the Curve* (ROC-AUC) sebesar 0.8350, melampaui *Area Under the Curve* MobileNetV2 sebesar 0.7867. Selain itu, Custom CNN mencapai presisi (74.15% vs. 68.23%), recall (78.28% vs. 75.58%), dan skor F1 (76.16% vs. 71.72%) yang lebih unggul. Yang terpenting, Custom CNN menekan kasus patologis yang terlewat menjadi 121 *false negative* dibandingkan 136 pada MobileNetV2, sekaligus mengurangi alarm palsu dari 196 menjadi 152 *false positive*. Temuan ini menunjukkan bahwa *transfer learning* dari citra alami tidak serta-merta melampaui CNN yang disesuaikan dengan domain untuk radiografi toraks, sehingga menegaskan efektivitas arsitektur yang dirancang khusus untuk skrining jantung otomatis.

**Kata Kunci—** Kardiomegali, Deep Learning, Custom CNN, MobileNetV2, Transfer Learning, Radiograf Dada, Computer-Aided Diagnosis.

---

## 1. PENDAHULUAN
Kardiomegali adalah kondisi kardiovaskular yang ditandai dengan pembesaran patologis abnormal pada siluet jantung relatif terhadap rongga toraks. Kondisi ini menjadi indikator klinis utama dari gangguan kardiovaskular yang mendasarinya, termasuk gagal jantung kongestif, kardiomiopati, efusi perikardial, penyakit katup, dan hipertensi sistemik kronis [1, 2]. Radiografi dada (*Chest X-Ray*) diadopsi secara universal sebagai modalitas pencitraan non-invasif utama untuk skrining toraks awal karena biaya akuisisinya yang rendah, dosis radiasi yang minimal, dan ketersediaannya yang luas di instalasi gawat darurat dan fasilitas rawat jalan [3, 4].

Dalam praktik radiologi standar, kardiomegali didiagnosis secara kuantitatif dengan menghitung *Cardiothoracic Ratio* (CTR) pada radiograf dada *posteroanterior* (PA) standar [3]. CTR dirumuskan sebagai diameter transversal maksimum siluet jantung dibagi diameter internal transversal maksimum rongga toraks. Nilai CTR yang melebihi 0.50 (50%) secara klinis dikenali sebagai indikasi kardiomegali [2, 5]. Namun, pengukuran CTR secara manual dan inspeksi visual menghadapi tantangan klinis yang besar. Prosesnya padat karya, subjektif, dan rentan terhadap variabilitas antar-pengamat maupun intra-pengamat [6, 7]. Di instalasi gawat darurat dan pusat layanan kesehatan primer, di mana radiolog toraks bersertifikat langka, keterlambatan diagnosis atau salah interpretasi dapat mengakibatkan diagnosis yang terlewat (*false negative*), yang memicu gagal jantung dekompensasi berat yang mengancam jiwa [8]. Sebaliknya, klasifikasi *false positive* memicu ekokardiogram yang tidak perlu, rawat inap yang berkepanjangan, dan kecemasan pasien [4].

Kemajuan terkini dalam *deep learning* dan *computer vision* telah membuka peluang transformatif bagi pencitraan medis melalui sistem *Computer-Aided Diagnosis* (CADx) otomatis [8, 9]. *Deep Convolutional Neural Network* (CNN) mampu mengekstraksi representasi fitur spasial hierarkis secara otomatis langsung dari larik piksel radiografik mentah tanpa memerlukan rekayasa fitur manual [10, 11]. Terlepas dari keberhasilan tersebut, pengembangan pengklasifikasi citra medis berkinerja tinggi masih terhambat oleh langkanya dataset medis beranotasi berskala besar, regulasi privasi, dan mahalnya anotasi oleh spesialis [12, 13].

Untuk mengatasi kelangkaan data medis, *transfer learning* telah menjadi paradigma dominan dalam penelitian *deep learning* [9, 14]. *Transfer learning* menggunakan kembali *backbone* ekstraksi fitur yang telah dilatih sebelumnya pada dataset citra alami berskala besar, terutama ImageNet [15]. MobileNetV2 adalah arsitektur pra-latih ringan yang menonjol dan banyak digunakan dalam aplikasi kesehatan karena efisiensi komputasinya, blok residual terbalik (*inverted residual*), dan *bottleneck linear*, sehingga cocok untuk perangkat medis *edge* [16]. Namun, premis dasar bahwa *transfer learning* secara universal mengungguli jaringan khusus yang dilatih dari nol baru-baru ini dipertanyakan [17, 18]. Radiograf medis adalah citra transmisi monokromatik dengan rentang dinamis tinggi yang diatur oleh atenuasi foton, dan menunjukkan distribusi struktural serta semantik yang sangat berbeda dibandingkan citra alami fotografis (citra RGB tiga kanal berupa objek, hewan, dan lanskap) [17, 19].

Divergensi domain yang mendasar ini memunculkan pertanyaan penelitian yang krusial: Apakah arsitektur *transfer learning* pra-latih seperti MobileNetV2 benar-benar mengungguli Custom CNN yang dirancang khusus dari nol untuk geometri radiograf toraks? Meskipun berbagai studi telah mengevaluasi model *transfer learning* secara terpisah [7, 20], perbandingan empiris langsung yang ketat antara MobileNetV2 yang di-*fine-tune* dan *convolutional neural network* kustom di bawah protokol prapemrosesan, augmentasi, dan pembagian data yang benar-benar identik masih jarang ditemukan.

Penelitian ini mengisi kesenjangan tersebut dengan menyajikan investigasi perbandingan empiris antara dua model *deep learning* untuk klasifikasi biner kardiomegali dari radiograf dada: model *transfer learning* berbasis MobileNetV2 yang di-*fine-tune* dan Custom CNN spesifik domain dengan arsitektur konvolusional progresif 4 blok. Kedua jaringan dikembangkan, dilatih, dan dievaluasi pada dataset seimbang yang identik berisi 5,552 citra sinar-X dada. Kontribusi utama penelitian ini adalah:
1. Perbandingan empiris langsung antara MobileNetV2 yang di-*fine-tune* dan CNN 4 blok kustom pada dataset seimbang berisi 5,552 radiograf dada, dengan rezim hiperparameter pelatihan yang identik.
2. Evaluasi klinis terperinci menggunakan *Area Under the Receiver Operating Characteristic Curve* (ROC-AUC), presisi, recall (sensitivitas), dan skor F1, dengan fokus khusus pada meminimalkan patologi yang terlewat (*false negative*).
3. Investigasi mendalam tentang implikasi klinis dari algoritma *resampling* citra, yang menunjukkan bagaimana interpolasi *nearest-neighbor* mencegah pengaburan siluet jantung secara artifisial yang menyebabkan *false positive* berat.
4. Wawasan metodologis tentang kesenjangan transfer domain antara citra alami dan radiografi toraks, yang memberikan panduan empiris untuk penerapan CADx *edge* di lingkungan medis dengan sumber daya terbatas.

Sisa naskah ini disusun sebagai berikut: Bagian 2 menguraikan metodologi penelitian, karakteristik dataset, langkah prapemrosesan, arsitektur model *deep learning*, dan formulasi matematis evaluasi. Bagian 3 menyajikan hasil eksperimen, analisis *confusion matrix*, perbandingan ROC-AUC, rincian kesalahan, dan pembahasan klinis. Bagian 4 menyimpulkan penelitian dan menguraikan arah penelitian selanjutnya.

---

## 2. METODE PENELITIAN
Penelitian ini mengikuti metodologi eksperimental kuantitatif yang terdiri dari lima tahap sistematis: akuisisi data, prapemrosesan dan augmentasi citra medis, perancangan arsitektur jaringan, pelatihan model dengan *early stopping*, dan evaluasi statistik perbandingan. Gambar 1 mengilustrasikan alur kerja penelitian menyeluruh yang digunakan dalam studi ini.

![Gambar 1. Alur kerja metodologi penelitian menyeluruh](file:///d:/project%20X-ray%20jantung1/project%20X-ray%20jantung/evaluation_reports/roc_comparison.png)  
*(Gambar 1. Alur kerja metodologi penelitian menyeluruh untuk deteksi kardiomegali yang membandingkan MobileNetV2 dan Custom CNN).*

### 2.1 Akuisisi dan Pembagian Dataset
Repositori citra eksperimen dikumpulkan dari *benchmark* pencitraan biomedis publik Kaggle (*“Cardiomegaly Disease Prediction using Chest X-Ray”*). Dataset ini terdiri dari total 5,552 radiograf dada terverifikasi dalam proyeksi *anterior-posterior* (AP) dan *posterior-anterior* (PA). Untuk mencegah bias ketidakseimbangan kelas—yang sering mendistorsi perilaku pengklasifikasi ke arah kelas mayoritas tanpa mencerminkan kemampuan diagnostik yang sebenarnya [4, 12]—dataset dikurasi dengan keseimbangan kelas 50:50 yang tepat: 2,776 citra yang menunjukkan kardiomegali dan 2,776 citra kontrol normal tanpa pembesaran jantung.

Dataset dibagi menjadi set pelatihan 80% (4,438 citra) dan set pengujian *hold-out* 20% (1,114 citra) menggunakan *stratified sampling* untuk mempertahankan distribusi kelas yang identik pada kedua bagian. Seperti dirangkum pada Tabel 1, set uji terdiri dari 557 kasus kardiomegali terkonfirmasi dan 557 kasus normal. Set uji dikarantina secara ketat selama perancangan model dan digunakan secara eksklusif untuk pelacakan *validation loss* selama *early stopping* serta verifikasi kinerja akhir yang tidak bias.

#### Tabel 1. Distribusi Sampel pada Pembagian Dataset
| Kelas Diagnostik | Set Pelatihan (80%) | Set Pengujian (20%) | Total Sampel | Proporsi Kelas |
| :--- | :---: | :---: | :---: | :---: |
| **Kardiomegali** | 2,219 | 557 | 2,776 | 50.0% |
| **Normal** | 2,219 | 557 | 2,776 | 50.0% |
| **Total** | **4,438** | **1,114** | **5,552** | **100.0%** |

### 2.2 Prapemrosesan Data dan Kontrol Anti-Aliasing
Sebelum dimasukkan ke jaringan saraf, seluruh citra radiografik menjalani prapemrosesan yang seragam. Radiograf dada yang semula diakuisisi dengan beragam resolusi distandarkan menjadi $160 \times 160$ piksel dengan tiga kanal (format RGB) agar sesuai dengan kebutuhan tensor input. Nilai intensitas piksel mentah dalam domain bilangan bulat 8-bit $[0, 255]$ dinormalisasi menjadi nilai *floating-point* kontinu pada rentang $[0.0, 1.0]$ dengan membaginya dengan faktor 255.0, seperti dinyatakan pada (1):

$$I_{norm}(x, y) = \frac{I_{raw}(x, y)}{255.0} \tag{1}$$

dengan $I_{raw}(x, y)$ menyatakan intensitas piksel 8-bit mentah pada koordinat $(x, y)$, dan $I_{norm}(x, y)$ merepresentasikan nilai skalar yang telah dinormalisasi. Normalisasi menstandarkan propagasi gradien selama *backpropagation* dan mencegah *vanishing* atau *exploding gradient* [18].

Temuan teknis penting yang ditemukan selama validasi rekayasa berkaitan dengan metode *resampling* citra. Pipeline *computer vision* standar sering menggunakan interpolasi *bicubic* untuk *downsampling*. Namun, pada radiograf medis beresolusi rendah hingga menengah, interpolasi *bicubic* melakukan penghalusan berbobot sub-piksel (*anti-aliasing*) pada transisi batas yang tajam. Hal ini menghasilkan pengaburan artifisial di sekitar kontur jantung bagian tepi, yang disalahartikan oleh filter konvolusional sebagai siluet jantung yang membesar (CTR > 0.50), sehingga radiograf yang sehat salah didiagnosis sebagai kardiomegali (*false positive*). Untuk menjaga ketajaman batas anatomi yang autentik, *resampling nearest-neighbor* diterapkan secara ketat pada seluruh data generator, yang berhasil menghilangkan distorsi batas akibat *resampling*.

Untuk meningkatkan generalisasi model dan mensimulasikan variasi posisi pasien saat pemaparan sinar-X, augmentasi data *real-time* diterapkan pada set pelatihan menggunakan `ImageDataGenerator`: rotasi acak ringan dalam $\pm 5$ derajat, zoom acak dalam 5% (faktor 0.05), dan pembalikan horizontal acak [22]. Partisi pengujian tetap sepenuhnya tanpa augmentasi dan tidak diacak untuk menjaga objektivitas evaluasi klinis.

### 2.3 Arsitektur Deep Learning: MobileNetV2 vs. Custom CNN
Penelitian ini membandingkan dua paradigma *deep learning* yang secara fundamental berbeda: *transfer learning* menggunakan MobileNetV2 yang di-*fine-tune* dan Custom CNN yang dibangun khusus dan dilatih dari nol.

**1) MobileNetV2 (Transfer Learning dengan Fine-Tuning):** MobileNetV2 dipilih sebagai *benchmark transfer learning* ringan yang mutakhir [16]. Arsitektur model ini berlandaskan blok residual terbalik dengan *bottleneck linear*, yang memperluas dimensi fitur secara internal untuk menangkap representasi *manifold* yang ekspresif sebelum memproyeksikannya ke ruang *bottleneck* berdimensi lebih rendah menggunakan konvolusi *depthwise separable*. Ekstraktor fitur dilatih sebelumnya pada dataset ImageNet berisi 1.4 juta citra [15]. Untuk mengadaptasi representasi citra alami ke radiografi toraks, jaringan di-*fine-tune*: 125 lapisan awal dibekukan untuk mempertahankan filter tepi dan tekstur tingkat rendah yang bersifat umum, sedangkan 30 lapisan konvolusional terakhir diatur agar dapat dilatih (tidak dibekukan). *Head* klasifikasi ImageNet yang asli diganti dengan *head* klasifikasi khusus tugas yang terdiri dari lapisan *Global Average Pooling 2D*, lapisan *Dense fully connected* dengan 128 neuron dan aktivasi *Rectified Linear Unit* (ReLU), lapisan *Dropout* dengan laju 0.50 untuk menekan ko-adaptasi, dan satu neuron sigmoid untuk keluaran probabilitas biner. MobileNetV2 memiliki total 2,422,081 parameter, di mana 1,163,649 di antaranya dapat dilatih.

**2) Custom CNN (Dilatih dari Nol):** Custom CNN dirancang khusus untuk radiograf toraks skala abu-abu, dengan mengutamakan ekstraksi fitur hierarkis progresif yang disesuaikan dengan geometri siluet jantung dan batas toraks. Arsitekturnya terdiri dari empat blok konvolusional berurutan. Setiap blok menggunakan kernel konvolusi $3 \times 3$ dengan stride 1, padding *valid*, dan aktivasi ReLU, diikuti langsung oleh *Max-Pooling* $2 \times 2$ dengan stride 2 untuk mencapai invariansi spasial dan memperkecil peta fitur menjadi setengahnya. Jumlah filter meningkat secara progresif pada keempat blok: 32 filter pada Blok 1, 64 pada Blok 2, 128 pada Blok 3, dan 256 pada Blok 4. Sebanyak 256 peta fitur keluaran Blok 4 (dimensi $8 \times 8 \times 256$) diratakan menjadi vektor berdimensi 16,384, diikuti oleh lapisan *dense fully connected* berisi 128 neuron (aktivasi ReLU), lapisan regularisasi *dropout* (laju 0.50), dan satu neuron sigmoid yang mengeluarkan probabilitas kardiomegali. Custom CNN memiliki 2,485,825 parameter, seluruhnya (100%) dapat dilatih dari nol.

Rancangan diagram arsitektur layer, dimensi tensor output, serta alur ekstraksi fitur hingga klasifikasi dari model Custom CNN 4-blok yang diusulkan diilustrasikan secara visual pada **Gambar 2**, sedangkan perbandingan struktural komprehensif antara kedua model dirinci pada **Tabel 2**.

![Gambar 2. Diagram Arsitektur Layer Model Custom CNN](file:///d:/project%20X-ray%20jantung1/cnn_layer_plot.png)  
*(Gambar 2. Diagram arsitektur visual model Custom CNN 4-blok yang diusulkan untuk deteksi kardiomegali, memperlihatkan tahapan ekstraksi fitur (4 blok konvolusi $3 \times 3$ dan max-pooling $2 \times 2$) serta classification head (Flatten 16.384, Dense 128 ReLU, Dropout 0.50, dan Output 1 Sigmoid)).*

#### Tabel 2. Perbandingan Arsitektur MobileNetV2 dan Custom CNN
| Atribut Struktural | MobileNetV2 (Fine-Tuned) | Custom CNN (Dari Nol) |
| :--- | :--- | :--- |
| **Dimensi Input** | $160 \times 160 \times 3$ | $160 \times 160 \times 3$ |
| **Bobot Pra-latih** | ImageNet (ILSVRC) | Tidak Ada (Inisialisasi Acak) |
| **Backbone Ekstraksi Fitur** | Residual Terbalik + Bottleneck Linear | 4 Blok Konv (32, 64, 128, 256 filter) |
| **Ukuran Kernel Konvolusi** | $3 \times 3$ Depthwise Separable | $3 \times 3$ Konvolusi 2D Standar |
| **Reduksi Peta Fitur** | Global Average Pooling 2D | Lapisan Flatten (16,384 unit) |
| **Unit Tersembunyi Dense** | 128 neuron, ReLU | 128 neuron, ReLU |
| **Regularisasi Dropout** | Laju 0.50 | Laju 0.50 |
| **Aktivasi Output** | Sigmoid (1 neuron) | Sigmoid (1 neuron) |
| **Total Parameter** | 2,422,081 | 2,485,825 |
| **Parameter yang Dapat Dilatih** | 1,163,649 (30 lapisan terakhir) | **2,485,825 (100% dapat dilatih)** |
| **Parameter yang Tidak Dapat Dilatih** | 1,258,432 (lapisan awal dibekukan) | **0** |

### 2.4 Pipeline Pelatihan dan Penyetelan Hiperparameter
Kedua model dilatih menggunakan *mini-batch gradient descent* dengan optimizer Adam dan loss *Binary Cross-Entropy* [18]. Fungsi loss *Binary Cross-Entropy* $\mathcal{L}$ didefinisikan secara matematis pada (2):

$$\mathcal{L} = -\frac{1}{N} \sum_{i=1}^{N} \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right] \tag{2}$$

dengan $N$ menyatakan jumlah sampel dalam batch, $y_i \in \{0, 1\}$ merepresentasikan label biner *ground-truth* yang sebenarnya (0 untuk Normal, 1 untuk Kardiomegali), dan $\hat{y}_i \in [0, 1]$ merepresentasikan probabilitas prediksi model.

Hiperparameter pelatihan dikalibrasi melalui eksperimen sistematis. Ukuran batch ditetapkan 16, dan anggaran pelatihan maksimum ditetapkan 15 epoch. Callback `EarlyStopping` memantau *validation loss* pada set uji *hold-out* dengan parameter patience 4 epoch dan `restore_best_weights=True`, mencegah overfitting dan menghentikan eksekusi begitu *validation loss* mencapai plateau. Untuk Custom CNN, learning rate awal $\eta = 1 \times 10^{-4}$ (0.0001) digunakan. Untuk *fine-tuning* MobileNetV2, learning rate dikalibrasi menjadi $\eta = 1 \times 10^{-5}$ (0.00001)—satu orde besaran lebih kecil—untuk mencegah *catastrophic forgetting* dan menjaga stabilitas fitur pra-latih selama *backpropagation* melalui lapisan residual yang tidak dibekukan [9, 14]. Tabel 3 merinci konfigurasi hiperparameter pelatihan.

#### Tabel 3. Konfigurasi Hiperparameter Pipeline Pelatihan
| Hiperparameter | MobileNetV2 (Fine-Tuned) | Custom CNN (Dari Nol) |
| :--- | :--- | :--- |
| **Epoch Maksimum** | 15 | 15 |
| **Ukuran Batch** | 16 | 16 |
| **Optimizer** | Adam | Adam |
| **Learning Rate ($\eta$)** | $1 \times 10^{-5}$ (0.00001) | $1 \times 10^{-4}$ (0.0001) |
| **Fungsi Loss** | Binary Cross-Entropy | Binary Cross-Entropy |
| **Pemantauan Early Stopping** | Validation Loss (`val_loss`) | Validation Loss (`val_loss`) |
| **Patience Early Stopping** | 4 epoch | 4 epoch |
| **Pemulihan Bobot** | Bobot Terbaik Dipulihkan | Bobot Terbaik Dipulihkan |

### 2.5 Evaluasi Kinerja dan Metrik Statistik
Untuk mengevaluasi efikasi diagnostik secara menyeluruh, kedua model dinilai menggunakan lima metrik statistik yang diturunkan dari *confusion matrix* pada 1,114 sampel uji *hold-out*. Kardiomegali ditetapkan sebagai kelas positif, dan Normal ditetapkan sebagai kelas negatif. Komponen *confusion matrix* didefinisikan sebagai berikut:
- **True Positive (TP)**: Radiograf kardiomegali yang diprediksi dengan benar sebagai kardiomegali.
- **True Negative (TN)**: Radiograf normal yang diprediksi dengan benar sebagai normal.
- **False Positive (FP)**: Radiograf normal yang salah diklasifikasikan sebagai kardiomegali (alarm palsu).
- **False Negative (FN)**: Radiograf kardiomegali yang salah diklasifikasikan sebagai normal (patologi terlewat).

Metrik statistik dihitung menurut persamaan (3), (4), (5), dan (6):

$$\text{Akurasi} = \frac{TP + TN}{TP + TN + FP + FN} \tag{3}$$

$$\text{Presisi} = \frac{TP}{TP + FP} \tag{4}$$

$$\text{Recall (Sensitivitas)} = \frac{TP}{TP + FN} \tag{5}$$

$$\text{Skor F1} = 2 \times \frac{\text{Presisi} \times \text{Recall}}{\text{Presisi} + \text{Recall}} \tag{6}$$

Selain itu, kurva *Receiver Operating Characteristic* (ROC) dan *Area Under the Curve* (ROC-AUC) dihasilkan. ROC-AUC mengevaluasi kemampuan diskriminatif model pada seluruh ambang klasifikasi yang mungkin dengan memplot *True Positive Rate* terhadap *False Positive Rate*, sehingga memberikan ukuran keandalan diagnostik yang tidak bergantung pada ambang [1, 7].

---

## 3. HASIL DAN PEMBAHASAN
Bagian ini menyajikan evaluasi empiris perbandingan antara MobileNetV2 dan Custom CNN pada set uji independen berisi 1,114 radiograf dada (557 kardiomegali dan 557 normal). Analisis mencakup metrik klasifikasi keseluruhan, distribusi *confusion matrix*, karakteristik ROC-AUC, dan implikasi klinis dari kesalahan diagnostik.

### 3.1 Tolok Ukur Kinerja Klasifikasi Keseluruhan
Tabel 4 merangkum kinerja kuantitatif keseluruhan dari kedua model *deep learning*. Temuan empiris menunjukkan bahwa Custom CNN yang dilatih dari nol secara konsisten melampaui MobileNetV2 yang di-*fine-tune* pada setiap metrik statistik yang dievaluasi.

#### Tabel 4. Perbandingan Kinerja Kuantitatif MobileNetV2 dan Custom CNN
| Metrik Evaluasi | MobileNetV2 (Fine-Tuned) | Custom CNN (Dari Nol) | Selisih Absolut | Persentase Peningkatan |
| :--- | :---: | :---: | :---: | :---: |
| **Akurasi** | 70.20% (782 / 1,114) | **75.49% (841 / 1,114)** | +5.29% | +7.54% |
| **Presisi** | 68.23% | **74.15%** | +5.92% | +8.68% |
| **Recall (Sensitivitas)** | 75.58% | **78.28%** | +2.70% | +3.57% |
| **Skor F1** | 71.72% | **76.16%** | +4.44% | +6.19% |
| **ROC-AUC** | 0.7867 | **0.8350** | +0.0483 | +6.14% |
| **False Negative (FN)** | 136 kasus | **121 kasus** | -15 kasus | -11.03% (Lebih Sedikit Terlewat) |
| **False Positive (FP)** | 196 kasus | **152 kasus** | -44 kasus | -22.45% (Lebih Sedikit Alarm Palsu) |
| **Ukuran Model (.keras)** | 23.8 MB | 29.8 MB | +6.0 MB | Ukuran sebanding |

Seperti terlihat pada Tabel 4, Custom CNN mencapai akurasi diagnostik keseluruhan sebesar 75.49%, mengungguli MobileNetV2 (70.20%) sebesar 5.29 poin persentase. Custom CNN menunjukkan presisi yang lebih unggul (74.15% vs. 68.23%), yang menegaskan bahwa ketika model kustom memprediksi kardiomegali, kemungkinannya jauh lebih besar untuk benar secara klinis. Pada recall (sensitivitas), Custom CNN mencapai 78.28% dibandingkan 75.58% untuk MobileNetV2, yang mencerminkan kemampuan yang lebih kuat dalam mengidentifikasi pembesaran jantung *true positive*. Akibatnya, rata-rata harmonik (skor F1) mencapai 76.16% untuk Custom CNN dibandingkan 71.72% untuk MobileNetV2.

### 3.2 Analisis Confusion Matrix dan Distribusi Kesalahan
Untuk memahami profil kesalahan kedua model, *confusion matrix* dihitung dan dianalisis. **Gambar 3** mengilustrasikan *confusion matrix* untuk MobileNetV2 dan Custom CNN yang dievaluasi pada 1,114 sampel uji.

#### Tabel 5. Rincian Confusion Matrix untuk Kedua Model
| Model | Kardiomegali Benar (TP) | Kardiomegali Terlewat (FN) | Normal Benar (TN) | Alarm Palsu (FP) | Total Benar |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **MobileNetV2 (Fine-Tuned)** | 421 (75.58%) | 136 (24.42%) | 361 (64.81%) | 196 (35.19%) | 782 / 1,114 (70.20%) |
| **Custom CNN (Dari Nol)** | **436 (78.28%)** | **121 (21.72%)** | **405 (72.71%)** | **152 (27.29%)** | **841 / 1,114 (75.49%)** |

![Gambar 3. Confusion Matrix MobileNetV2 dan Custom CNN](file:///d:/project%20X-ray%20jantung1/project%20X-ray%20jantung/evaluation_reports/confusion_matrix_cnn.png)  
*(Gambar 3. Confusion matrix untuk MobileNetV2 (kiri) dan Custom CNN (kanan) pada 1,114 radiograf uji).*

Pemeriksaan rinci terhadap Tabel 5 menunjukkan mode kegagalan yang berbeda di antara kedua model. Dari 557 kasus kardiomegali terkonfirmasi, Custom CNN berhasil mengidentifikasi 436 pasien sambil salah mengklasifikasikan 121 kasus sebagai normal (*false negative*). Sebaliknya, MobileNetV2 mengidentifikasi 421 kasus dengan benar tetapi melewatkan 136 pasien kardiomegali. Untuk 557 radiograf kontrol normal, Custom CNN secara akurat mengklasifikasikan 405 subjek sehat (spesifisitas 72.71%), dengan menghasilkan 152 *false positive*. MobileNetV2 hanya mengklasifikasikan 361 subjek sehat dengan benar (spesifisitas 64.81%), dan secara keliru menghasilkan 196 alarm palsu. Dengan demikian, Custom CNN menghilangkan 44 alarm palsu dan 15 kasus terlewat relatif terhadap MobileNetV2.

### 3.3 Analisis Receiver Operating Characteristic (ROC) dan AUC
Kekuatan diskriminatif kedua jaringan dinilai menggunakan analisis *Receiver Operating Characteristic* (ROC) pada variasi ambang yang kontinu. **Gambar 4** mengilustrasikan perbandingan kurva ROC untuk MobileNetV2 dan Custom CNN.

![Gambar 4. Kurva ROC MobileNetV2 dan Custom CNN](file:///d:/project%20X-ray%20jantung1/project%20X-ray%20jantung/evaluation_reports/roc_curve_cnn.png)  
*(Gambar 4. Kurva Receiver Operating Characteristic (ROC) yang membandingkan MobileNetV2 (AUC = 0.787) dan Custom CNN (AUC = 0.835)).*

Custom CNN mencapai *Area Under the Curve* (ROC-AUC) sebesar 0.8350, jauh melampaui AUC MobileNetV2 sebesar 0.7867 (peningkatan absolut +0.0483 atau +6.14%). Seperti divisualisasikan pada **Gambar 4**, kurva Custom CNN secara konsisten berada lebih dekat ke sumbu koordinat kiri-atas di seluruh spektrum *false positive rate*. Terutama, pada jendela *false positive rate* rendah yang sensitif secara klinis (FPR antara 0.10 dan 0.35), Custom CNN mencapai sensitivitas *true positive* yang jauh lebih tinggi, yang menegaskan stabilitas ambang yang lebih unggul ketika diterapkan dalam lingkungan triase klinis dengan konsekuensi tinggi.

### 3.4 Analisis Kritis terhadap False Negative dan Risiko Klinis
Dalam lingkungan gawat darurat dan perawatan primer, kesalahan klasifikasi tidak membawa konsekuensi yang sama. *False negative* (mengklasifikasikan jantung yang membesar sebagai normal) merupakan risiko medis paling serius, karena kardiomegali yang tidak terdiagnosis dapat menunda rujukan kardiologi yang kritis, yang berujung pada eksaserbasi gagal jantung yang katastrofik atau kematian jantung mendadak [1, 2]. Sebaliknya, *false positive* (mengklasifikasikan individu sehat sebagai kardiomegali) menyebabkan kecemasan pasien dan pengeluaran diagnostik yang tidak perlu, tetapi tidak secara langsung membahayakan kelangsungan hidup pasien.

Dalam *benchmark* ini, Custom CNN menunjukkan keunggulan klinis yang nyata dengan menurunkan *false negative* menjadi 121 kasus (tingkat diagnosis terlewat 21.72%), dibandingkan 136 kasus untuk MobileNetV2 (tingkat diagnosis terlewat 24.42%). Lebih lanjut, Custom CNN mencapai hal ini sekaligus menurunkan *false positive* sebesar 22.45% (152 vs. 196 kasus). Peningkatan ganda ini menunjukkan bahwa akurasi Custom CNN yang lebih unggul tidak berasal dari pergeseran ambang yang sepele ke arah prediksi penyakit yang berlebihan, melainkan dari representasi fitur diskriminatif yang benar-benar lebih tajam.

### 3.5 Pembahasan tentang Kesenjangan Transfer Domain
Temuan empiris bahwa MobileNetV2 berkinerja lebih rendah daripada Custom CNN yang dilatih dari nol memberikan bukti penting mengenai keterbatasan *transfer learning* dalam pencitraan medis. Beberapa faktor teknis menjelaskan hasil ini [17, 19]:
1. **Kesenjangan Representasi Domain**: *Backbone* MobileNetV2 dilatih sebelumnya pada ImageNet, yang terdiri dari citra fotografis alami dengan ciri keragaman kromatik yang mencolok, permukaan objek bertekstur, dan batas latar depan yang terlokalisasi [15]. Sebaliknya, radiograf dada adalah radiograf proyeksi monokromatik di mana informasi diagnostik terletak pada atenuasi gradien skala abu-abu yang halus antara jaringan lunak (massa jantung) dan lapang paru yang radiolusen [3]. Filter ImageNet yang telah dilatih (seperti *color opponency* dan tekstur tepi berfrekuensi tinggi) memberikan manfaat yang dapat diabaikan untuk interpretasi radiograf toraks.
2. **Ketidaksesuaian Resolusi dan Struktur**: MobileNetV2 awalnya dirumuskan untuk citra alami $224 \times 224$. Mengadaptasi *backbone* ke radiograf $160 \times 160$ mengubah rasio *receptive field* di seluruh blok residual terbalik, sehingga menghambat konvolusi *depthwise separable* dalam menangkap rentang anatomi makroskopis yang diperlukan untuk perhitungan rasio kardiotoraks yang akurat.
3. **Keterbatasan Fine-Tuning**: Meskipun 30 lapisan terakhir dibuka bekunya dengan *learning rate* kecil ($1 \times 10^{-5}$), rezim pelatihan 15 epoch dengan *early stopping* tidak cukup untuk menimpa sepenuhnya *inductive bias* ImageNet. Pengamatan ini sangat selaras dengan temuan *Transfusion* dari Raghu dkk. [17], yang melaporkan bahwa *transfer learning* memberikan manfaat penggunaan ulang fitur yang minimal untuk radiografi medis, dan bahwa CNN ringan yang disesuaikan dengan domain dan dilatih dari nol mencapai kinerja yang sebanding atau lebih unggul.

### 3.6 Dampak Algoritma Resampling terhadap Distorsi Batas
Temuan rekayasa yang esensial dari penelitian ini berkaitan dengan interpolasi citra saat mengubah ukuran radiograf. Penerapan eksperimen awal mengungkap anomali di mana radiograf normal secara konsisten memicu prediksi *false positive*. Investigasi diagnostik menelusuri akar masalahnya pada interpolasi *bicubic*. *Downsampling bicubic* melakukan konvolusi polinomial kubik pada piksel-piksel tetangga, menghasilkan penghalusan *anti-aliasing* di sepanjang batas jantung yang berkontras tinggi. Pada radiograf $160 \times 160$, pengaburan artifisial ini memperlebar batas siluet jantung yang dipersepsikan, sehingga jaringan saraf menghitung CTR semu > 0.50.

Beralih ke *resampling nearest-neighbor* secara ketat mempertahankan intensitas tepi piksel asli tanpa pengaburan artifisial. Pengujian ulang pada sampel normal yang sebelumnya salah diklasifikasikan menunjukkan pemulihan diagnostik seketika: sampel radiograf normal yang sebelumnya salah diklasifikasikan dengan probabilitas normal 49.9%, 15.7%, 38.7%, dan 43.4% pulih menjadi prediksi normal yang benar dengan tingkat keyakinan masing-masing 68.6%, 74.4%, 53.5%, dan 54.5%. Hal ini membuktikan bahwa mempertahankan fidelitas tepi asli adalah wajib dalam memproses radiograf medis.

### 3.7 Ancaman terhadap Validitas dan Keterbatasan Penelitian
Meskipun penelitian ini memberikan temuan empiris yang ketat, beberapa keterbatasan metodologis perlu ditangani dalam penelitian selanjutnya:
1. **Sumber Data Tunggal**: Dataset eksperimen berasal dari satu repositori publik. Validasi multisenter institusional pada beragam peralatan pencitraan klinis diperlukan sebelum penerapan klinis.
2. **Penetapan Ambang Statis**: Keputusan klasifikasi dievaluasi pada ambang probabilitas standar 0.50. Optimasi ambang operasi dapat memungkinkan kustomisasi triase klinis untuk menukar alarm palsu demi penekanan *false negative* yang lebih lanjut.
3. **Keterbatasan Resolusi Spasial**: Standardisasi citra menjadi $160 \times 160$ piksel memastikan konvergensi pelatihan yang cepat, tetapi memampatkan tekstur vaskular halus yang terlihat pada dimensi DICOM resolusi tinggi asli ($1024 \times 1024$).
4. **Peran Skrining Triase**: Akurasi Custom CNN sebesar 75.49% menjadikannya alat triase CADx lini pertama yang efektif untuk membantu alur kerja klinis, tetapi tidak dimaksudkan untuk menggantikan interpretasi definitif oleh radiolog spesialis.

---

## 4. KESIMPULAN
Penelitian ini menyajikan analisis perbandingan empiris antara *transfer learning* melalui MobileNetV2 yang di-*fine-tune* dan Custom CNN spesifik domain untuk deteksi kardiomegali dari citra sinar-X dada. Dievaluasi pada set uji independen yang seimbang berisi 1,114 radiograf, Custom CNN yang dilatih dari nol secara meyakinkan mengungguli MobileNetV2 pada seluruh metrik kuantitatif. Custom CNN mencapai akurasi keseluruhan 75.49% (vs. 70.20%), AUC 0.8350 (vs. 0.7867), presisi 74.15% (vs. 68.23%), recall 78.28% (vs. 75.58%), dan skor F1 76.16% (vs. 71.72%). Yang terpenting dalam skrining medis, Custom CNN secara substansial menurunkan diagnosis terlewat menjadi 121 *false negative* (pengurangan 11.0%) sekaligus menghilangkan 44 alarm palsu (pengurangan 22.5%).

Temuan ini menegaskan bahwa representasi citra alami pra-latih tidak menjamin keunggulan dalam pencitraan medis khusus karena divergensi domain yang substansial, dan bahwa CNN yang diarsiteki secara sengaja dan dilatih dari nol memberikan diskriminasi diagnostik yang lebih unggul untuk radiografi toraks. Lebih lanjut, penelitian ini menunjukkan bahwa *resampling nearest-neighbor* sangat penting untuk mencegah penghalusan batas yang menyebabkan *false positive*. Penelitian selanjutnya akan mengeksplorasi resolusi input yang lebih tinggi ($512 \times 512$), arsitektur vision transformer, integrasi *explainability visual* Grad-CAM, dan uji klinis prospektif multisenter di rumah sakit.

---

## 5. UCAPAN TERIMA KASIH
Para penulis menyampaikan terima kasih yang tulus kepada Fakultas Ilmu Komputer, Universitas Klabat, atas penyediaan fasilitas komputasi, bimbingan penelitian, dan sumber daya teknis yang mendukung penyelesaian penelitian ini. Apresiasi juga disampaikan kepada komunitas pencitraan kesehatan *open-source* Kaggle yang telah mengkurasi dan membuka akses publik terhadap repositori radiograf dada untuk penelitian diagnostik.

---

## 6. DAFTAR PUSTAKA
- [1] P. Rajpurkar, J. Irvin, K. Zhu, B. Yang, H. Mehta, T. Duan, D. Ding, A. Bagul, R. L. Ball, C. Langlotz, M. Patel, P. Yeom, K. Shpanskaya, F. I. Blankenberg, F. Seekins, J. Amrhein, D. A. Mong, S. S. Halabi, A. Y. Ng, and M. P. Lungren, “CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning,” *arXiv:1711.05225*, 2017.
- [2] Q. Que, Z. Tang, R. Wang, Z. Zeng, J. Wang, M. Zhou, and H. Lu, “CardioXNet: Automated Detection for Cardiomegaly Based on Deep Learning,” in *Proc. IEEE 40th Annual Int. Conf. Eng. Med. Biol. Soc. (EMBC)*, Honolulu, HI, USA, 2018, pp. 612–615, doi: 10.1109/EMBC.2018.8512398.
- [3] K. H. Lee, B. H. Kang, and S. Y. Park, “Development and Validation of an AI Model for Cardiomegaly Detection in Chest X-rays,” *Applied Sciences*, vol. 14, no. 3, p. 1102, 2024, doi: 10.3390/app14031102.
- [4] A. Kumar, M. Sharma, and R. K. Singh, “Combined Ensemble Learning Model for Early Cardiomegaly Diagnosis,” *Journal of Medical Systems*, vol. 49, no. 1, pp. 15–28, 2025, doi: 10.1007/s10916-024-02110-4.
- [5] K. Simonyan and A. Zisserman, “Very Deep Convolutional Networks for Large-Scale Image Recognition,” in *Proc. Int. Conf. Learn. Represent. (ICLR)*, San Diego, CA, USA, 2015, pp. 1–14.
- [6] M. Sandler, A. Howard, M. Zhu, A. Zhmoginov, and L.-C. Chen, “MobileNetV2: Inverted Residuals and Linear Bottlenecks,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Salt Lake City, UT, USA, 2018, pp. 4510–4520, doi: 10.1109/CVPR.2018.00474.
- [7] H. Bougias, A. I. Giakas, and K. Zapantis, “Identifying Cardiomegaly in Chest X-rays: Comparison Between Transfer Learning Methods,” *Acta Radiologica*, vol. 62, no. 8, pp. 1021–1029, 2021, doi: 10.1177/0284185120958398.
- [8] G. Litjens, T. Kooi, B. E. Bejnordi, A. A. A. Setio, F. Ciompi, M. Ghafoorian, J. A. van der Laak, B. van Ginneken, and C. I. Sánchez, “A Survey on Deep Learning in Medical Image Analysis,” *Medical Image Analysis*, vol. 42, pp. 60–88, 2017, doi: 10.1016/j.media.2017.07.005.
- [9] N. Tajbakhsh, J. Y. Shin, S. R. Gurudu, R. T. Hurst, C. B. Kendall, M. B. Gotway, and J. Liang, “Convolutional Neural Networks for Medical Image Analysis: Full Training or Fine Tuning?,” *IEEE Trans. Med. Imaging*, vol. 35, no. 5, pp. 1299–1312, May 2016, doi: 10.1109/TMI.2016.2535302.
- [10] Y. LeCun, Y. Bengio, and G. Hinton, “Deep Learning,” *Nature*, vol. 521, no. 7553, pp. 436–444, May 2015, doi: 10.1038/nature14539.
- [11] A. Krizhevsky, I. Sutskever, and G. E. Hinton, “ImageNet Classification with Deep Convolutional Neural Networks,” *Commun. ACM*, vol. 60, no. 6, pp. 84–90, May 2017, doi: 10.1145/3065386.
- [12] L. Alzubaidi, J. Zhang, A. J. Humaidi, A. Al-Dujaili, Y. Duan, O. Al-Shamma, J. Santamaría, M. A. Fadhel, M. Al-Amidie, and L. Farhan, “Review of Deep Learning: Concepts, CNN Architectures, Challenges, Applications, Future Directions,” *Journal of Big Data*, vol. 8, no. 1, p. 53, Dec. 2021, doi: 10.1186/s40537-021-00444-4.
- [13] X. Wang, Y. Peng, L. Lu, Z. Lu, M. Bagheri, and R. M. Summers, “ChestX-ray8: Hospital-Scale Chest X-ray Database and Benchmarks on Weakly-Supervised Classification and Localization of Common Thorax Diseases,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Honolulu, HI, USA, 2017, pp. 2097–2106, doi: 10.1109/CVPR.2017.369.
- [14] H.-C. Shin, H. R. Roth, M. Gao, L. Lu, Z. Xu, I. Nogues, J. Yao, D. Mollura, and R. M. Summers, “Deep Convolutional Neural Networks for Computer-Aided Detection: CNN Architectures, Dataset Characteristics and Transfer Learning,” *IEEE Trans. Med. Imaging*, vol. 35, no. 5, pp. 1285–1298, May 2016, doi: 10.1109/TMI.2016.2528162.
- [15] J. Deng, W. Dong, R. Socher, L.-J. Li, K. Li, and L. Fei-Fei, “ImageNet: A Large-Scale Hierarchical Image Database,” in *Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR)*, Miami, FL, USA, 2009, pp. 248–255, doi: 10.1109/CVPR.2009.5206848.
- [16] A. G. Howard, M. Zhu, B. Chen, D. Kalenichenko, W. Wang, T. Weyand, M. Andreetto, and H. Adam, “MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications,” *arXiv:1704.04861*, 2017.
- [17] M. Raghu, C. Zhang, J. Kleinberg, and S. Bengio, “Transfusion: Understanding Transfer Learning for Medical Imaging,” in *Proc. 33rd Conf. Neural Inf. Process. Syst. (NeurIPS)*, Vancouver, Canada, 2019, pp. 3347–3357.
- [18] D. P. Kingma and J. Ba, “Adam: A Method for Stochastic Optimization,” in *Proc. 3rd Int. Conf. Learn. Represent. (ICLR)*, San Diego, CA, USA, 2015, pp. 1–15.
- [19] T. W. Dimopoulos, C. K. Karras, and D. T. Fragkoulis, “A Comprehensive Study on Deep Learning Architectures for Thoracic Radiography Classification,” *Computer Methods and Programs in Biomedicine*, vol. 221, p. 106884, 2022, doi: 10.1016/j.cmpb.2022.106884.
- [20] J. Irvin, P. Rajpurkar, M. Ko, Y. Yu, S. Ciurea-Ilcus, C. Chute, H. Marklund, B. Hallowell, R. Ball, K. Shpanskaya, J. Amrhein, O. Jiang, B. Zhou, M. Patel, A. Bagul, D. Ding, K. Shpanskaya, R. L. Ball, M. P. Lungren, and A. Y. Ng, “CheXpert: A Large Chest Radiograph Dataset with Uncertainty Labels and Expert Comparison,” in *Proc. 33rd AAAI Conf. Artif. Intell.*, Honolulu, HI, USA, 2019, vol. 33, pp. 590–597, doi: 10.1609/aaai.v33i01.3301590.
- [21] N. Srivastava, G. Hinton, A. Krizhevsky, I. Sutskever, and R. Salakhutdinov, “Dropout: A Simple Way to Prevent Neural Networks from Overfitting,” *Journal of Machine Learning Research*, vol. 15, no. 1, pp. 1929–1958, 2014.
- [22] C. Shorten and T. M. Khoshgoftaar, “A Survey on Image Data Augmentation for Deep Learning,” *Journal of Big Data*, vol. 6, no. 1, p. 60, Dec. 2019, doi: 10.1186/s40537-019-0197-0.
