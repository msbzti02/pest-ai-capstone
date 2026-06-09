# 🐛 PestAI — AI-Powered Insect Pest Classification Platform

> **Capstone Project** — Istanbul Bahçeşehir University, Faculty of Engineering and Natural Sciences  
> Artificial Intelligence Engineering Department

An end-to-end, production-grade AI platform for classifying **102 species of agricultural insect pests** using the [IP102 dataset](https://github.com/xpwu95/IP102). Built with a modern **microservices architecture**, featuring deep learning inference, explainable AI (XAI) visualizations, an AI-powered agronomist chatbot, and a premium SaaS-grade dashboard UI.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **Deep Learning Models** | EfficientNet-B4 & ViT-B/16 with 102-class classification |
| 🔥 **Grad-CAM Heatmaps** | Visual attention maps showing where the model looks |
| 🟢 **LIME Superpixels** | Local interpretable model-agnostic explanations |
| 📊 **SHAP Analysis** | Feature importance visualization via Shapley values |
| ⚡ **Dynamic Quantization** | INT8 edge-optimized models for faster inference |
| 🤖 **AI Chatbot** | OpenRouter-powered agronomist assistant for pest treatment advice |
| 🎨 **Premium Dashboard UI** | Dark-mode glassmorphism UI with Tailwind CSS v4 |
| 📄 **PDF Export** | One-click export of full diagnostic reports |
| 🛡️ **Confidence Thresholds** | Configurable minimum confidence for diagnosis reliability |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PestAI Platform                              │
├──────────────┬──────────────────────┬───────────────────────────────┤
│  React Client│   Node.js Gateway    │   FastAPI ML Service          │
│  (Vite + TW4)│   (Express Proxy)    │   (PyTorch Inference)         │
│  Port: 3000  │   Port: 5000         │   Port: 8000                  │
├──────────────┴──────────────────────┴───────────────────────────────┤
│                       OpenRouter API (LLM Chatbot)                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
capstone_final/
├── client/                    # React Frontend (Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Sidebar
│   │   │   ├── analysis/      # ResultsPanel, XAIDashboard
│   │   │   ├── ui/            # Hero, UploadZone
│   │   │   └── Chatbot.jsx    # AI Agronomist Chatbot
│   │   ├── App.jsx            # Main application layout
│   │   ├── index.css          # Design system & theme tokens
│   │   └── main.jsx           # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Node.js API Gateway
│   ├── index.js               # Express proxy + OpenRouter chatbot
│   └── package.json
│
├── ml_service/                # FastAPI ML Inference Service
│   ├── main.py                # Prediction endpoint + XAI pipeline
│   └── requirements.txt       # Python ML dependencies
│
├── notebooks/                 # Jupyter Notebooks (Training & Analysis)
│   ├── 01_EDA.ipynb           # Exploratory Data Analysis
│   ├── 02_Model_Training.ipynb        # ViT-B/16 training
│   ├── 03_EfficientNet_Training.ipynb # EfficientNet-B4 training
│   ├── 04_Explainable_AI.ipynb        # Grad-CAM, LIME, SHAP
│   └── 05_Model_Optimization.ipynb    # Dynamic Quantization
│
├── app_streamlit.py           # Legacy Streamlit interface (backup)
├── dataset.py                 # IP102 Dataset class & DataLoader
├── baslat.bat                 # Windows one-click launcher
├── .env                       # API keys (not committed)
├── .gitignore
├── requirements.txt           # Root Python dependencies
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** with pip
- **Node.js 18+** with npm
- An **OpenRouter API key** (for the AI chatbot)

### 1. Clone the Repository
```bash
git clone https://github.com/ayberkpalta/ip201_capstone.git
cd ip201_capstone
```

### 2. Set Up Python Environment
```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
pip install -r ml_service/requirements.txt
```

> **⚠️ GPU Note:** For CUDA-accelerated inference, install PyTorch with GPU support from [pytorch.org](https://pytorch.org/get-started/locally/).

### 3. Install Node.js Dependencies
```bash
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 5. Download IP102 Dataset
Download from the [IP102 GitHub page](https://github.com/xpwu95/IP102) and place under `data/classification/`:
```
data/classification/
├── train/   (102 class folders: 0/, 1/, ..., 101/)
├── val/
└── test/
```

### 6. Launch the Platform
**Option A — One-click (Windows):**
```bash
baslat.bat
```

**Option B — Manual:**
```bash
# Terminal 1: ML Service
cd ml_service && python -m uvicorn main:app --host 127.0.0.1 --port 8000

# Terminal 2: API Gateway
cd server && node index.js

# Terminal 3: Frontend
cd client && npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## 🧪 Notebooks

Run notebooks in order for full reproducibility:

| # | Notebook | Description | Est. Time |
|---|----------|-------------|-----------|
| 1 | `01_EDA.ipynb` | Dataset analysis, class distributions, sample images | ~5 min |
| 2 | `02_Model_Training.ipynb` | ViT-B/16 fine-tuning (10 epochs) | ~3-4 hrs (GPU) |
| 3 | `03_EfficientNet_Training.ipynb` | EfficientNet-B4 fine-tuning (10 epochs) | ~2-3 hrs (GPU) |
| 4 | `04_Explainable_AI.ipynb` | Grad-CAM heatmaps + SHAP analysis | ~10 min |
| 5 | `05_Model_Optimization.ipynb` | INT8 Dynamic Quantization | ~2 min |

> **💡 Tip:** Notebooks 2 & 3 require a GPU. Use Google Colab or a local NVIDIA GPU.

---

## 🏗️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Deep Learning** | PyTorch, timm, torchvision |
| **Models** | ViT-B/16, EfficientNet-B4 |
| **XAI / Explainability** | Grad-CAM (pytorch-grad-cam), LIME, SHAP |
| **Model Optimization** | PyTorch Dynamic Quantization (INT8) |
| **ML Backend** | FastAPI, Uvicorn |
| **API Gateway** | Node.js, Express, http-proxy-middleware |
| **LLM / Chatbot** | OpenRouter API (GPT-4o-mini, Claude, etc.) |
| **Frontend** | React 18, Vite 5, Tailwind CSS v4, Framer Motion |
| **UI Components** | Lucide React, Glassmorphism, Dark Mode |
| **Data Augmentation** | Albumentations |
| **Analysis** | Pandas, Matplotlib, Seaborn, Scikit-learn |

---

## 📊 Model Performance

| Model | Original Size | Quantized Size | Reduction |
|-------|--------------|----------------|-----------|
| **ViT-B/16** | ~327 MB | ~84 MB | **~75%** |
| **EfficientNet-B4** | ~68 MB | ~67 MB | ~1% |

> ViT benefits significantly from quantization due to its Linear-layer-dominant architecture, while EfficientNet's Conv2d-based design shows minimal impact.

---

## ⚠️ Known Issues & Solutions

| Issue | Solution |
|-------|---------|
| `KMP_DUPLICATE_LIB_OK` error | Already handled in `ml_service/main.py` |
| Grad-CAM unavailable with quantized model | INT8 models don't support gradient computation — use the full model |
| SHAP runs slowly (>5 min) | Expected behavior; reduce `lime_samples` or use Grad-CAM instead |
| Model `.pth` files missing from repo | Excluded via `.gitignore` (too large). Share via Google Drive |
| Chatbot returns "API key error" | Check your `OPENROUTER_API_KEY` in the `.env` file |

---

## 📝 License

This project was developed as part of the Istanbul Bahçeşehir University Capstone course (IP201).
