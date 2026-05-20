# 🐛 Deep Learning-Based Insect Pest Recognition System

> **Capstone Project** — Istanbul BAHCESEHIR University, Faculty of Engineering and Natural Sciences  
> Artificial Intelligence Engineering Department

An end-to-end deep learning system for classifying **102 species of agricultural insect pests** using the [IP102 dataset](https://github.com/xpwu95/IP102). The project includes model training, explainable AI analysis, model optimization, and a real-time web application.

---



```
capstone_final/
├── app.py                 # Streamlit web arayüzü
├── dataset.py             # IP102 veri seti sınıfı ve DataLoader
├── requirements.txt       # Python bağımlılıkları
├── .gitignore
├── notebooks/
│   ├── 01_EDA.ipynb                  # Keşifsel Veri Analizi
│   ├── 02_Model_Training.ipynb       # ViT-B/16 eğitimi
│   ├── 03_EfficientNet_Training.ipynb # EfficientNet-B4 eğitimi
│   ├── 04_Explainable_AI.ipynb       # Grad-CAM & SHAP analizi
│   └── 05_Model_Optimization.ipynb   # Quantization (Model Küçültme)
└── data/                  # IP102 veri seti (Git'e dahil değil)
    └── classification/
        ├── train/
        ├── val/
        └── test/
```

---

## 🚀 Kurulum (Setup)

### 1. Repo'yu Klonlayın
```bash
git clone https://github.com/ayberkpalta/ip201_capstone.git
cd ip201_capstone
```

### 2. Sanal Ortam (Virtual Environment) Oluşturun
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Bağımlılıkları Yükleyin
```bash
pip install -r requirements.txt
```

> **⚠️ PyTorch GPU Notu:** Eğer NVIDIA GPU'nuz varsa ve CUDA kullanmak istiyorsanız, önce [pytorch.org](https://pytorch.org/get-started/locally/) adresinden sisteminize uygun CUDA versiyonunu yükleyin. Örnek:
> ```bash
> pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
> ```

### 4. IP102 Veri Setini İndirin
Veri setini [IP102 GitHub sayfasından](https://github.com/xpwu95/IP102) indirip `data/classification/` klasörünün altına `train/`, `val/`, `test/` olarak yerleştirin.

```
data/
└── classification/
    ├── train/
    │   ├── 0/
    │   ├── 1/
    │   └── ... (102 sınıf klasörü)
    ├── val/
    └── test/
```

---

## 🧪 Notebook'ları Çalıştırma

Notebook'ları sırasıyla çalıştırmanız önerilir:

| Sıra | Notebook | Açıklama | Tahmini Süre |
|------|----------|----------|-------------|
| 1 | `01_EDA.ipynb` | Veri seti analizi, sınıf dağılımları, örnek görseller | ~5 dk |
| 2 | `02_Model_Training.ipynb` | ViT-B/16 model eğitimi (10 epoch) | ~3-4 saat (GPU) |
| 3 | `03_EfficientNet_Training.ipynb` | EfficientNet-B4 model eğitimi (10 epoch) | ~2-3 saat (GPU) |
| 4 | `04_Explainable_AI.ipynb` | Grad-CAM ısı haritaları + SHAP analizi | ~10 dk |
| 5 | `05_Model_Optimization.ipynb` | Dynamic Quantization ile model küçültme | ~2 dk |

> **💡 İpucu:** 2 ve 3 numaralı notebook'lar GPU gerektirir. Google Colab veya yerel NVIDIA GPU kullanılabilir.

---

## 🌐 Web Uygulamasını Çalıştırma (Streamlit)

Model eğitimi tamamlandıktan sonra (veya önceden eğitilmiş `.pth` dosyaları `notebooks/` klasöründe mevcutsa):

```bash
streamlit run app.py --server.fileWatcherType none
```

Tarayıcınızda `http://localhost:8501` adresine gidin.

### Web Uygulaması Özellikleri:
- 📸 **Görüntü Yükleme**: JPG/PNG formatında böcek fotoğrafı yükleyin
- 🧠 **Model Seçimi**: EfficientNet-B4 veya ViT-B/16 arasında seçim yapın
- 📊 **Top-3 Tahmin**: En olası 3 böcek türünü güven skoru ile gösterir
- 🔥 **Grad-CAM (XAI)**: Modelin kararını nasıl verdiğini ısı haritası ile açıklar

---

## 🏗️ Kullanılan Teknolojiler

| Kategori | Teknoloji |
|----------|-----------|
| **Derin Öğrenme** | PyTorch, timm |
| **Modeller** | ViT-B/16, EfficientNet-B4 |
| **Veri Artırma** | Albumentations |
| **XAI** | Grad-CAM (pytorch-grad-cam), SHAP |
| **Optimizasyon** | PyTorch Dynamic Quantization |
| **Web Arayüzü** | Streamlit |
| **Görüntü İşleme** | OpenCV, Pillow |
| **Analiz** | Pandas, Matplotlib, Seaborn, Scikit-learn |

---

## 📊 Model Sonuçları

| Model | Orijinal Boyut | Kuantize Boyut | Azalma |
|-------|---------------|----------------|--------|
| **ViT-B/16** | ~327 MB | ~84 MB | **~75%** |
| **EfficientNet-B4** | ~68 MB | ~67 MB | ~1% |

> ViT modeli tamamen Linear katmanlardan oluştuğu için kuantizasyondan çok büyük fayda görürken, EfficientNet Conv2d tabanlı olduğu için minimal etkilenmiştir.

---

## ⚠️ Bilinen Sorunlar ve Çözümler

| Sorun | Çözüm |
|-------|-------|
| Streamlit Windows'ta kendi kendine kapanıyor | `--server.fileWatcherType none` flag'ini ekleyin |
| `KMP_DUPLICATE_LIB_OK` hatası | `app.py`'de zaten otomatik olarak çözülmüştür |
| SHAP çok yavaş çalışıyor (>5 dk) | Normal davranıştır, Grad-CAM kullanın |
| Model `.pth` dosyaları GitHub'da yok | `.gitignore`'da olduğu için. Google Drive ile paylaşın |

---

## 📝 Lisans

Bu proje Istanbul Topkapi University Capstone dersi kapsamında geliştirilmiştir.
