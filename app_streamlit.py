import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
os.environ['OMP_NUM_THREADS'] = '1'

import streamlit as st
from PIL import Image

# --- PAGE CONFIG ---
st.set_page_config(page_title="PestAI - IP102", page_icon="🐛", layout="wide")

# --- IP102 Class Names ---
IP102_CLASSES = {
    0: "Rice Leaf Roller", 1: "Rice Leaf Caterpillar", 2: "Paddy Stem Maggot",
    3: "Asiatic Rice Borer", 4: "Yellow Rice Borer", 5: "Rice Gall Midge",
    6: "Rice Stemfly", 7: "Brown Plant Hopper", 8: "White Backed Plant Hopper",
    9: "Small Brown Plant Hopper", 10: "Rice Water Weevil", 11: "Rice Leafhopper",
    12: "Grain Spreader Thrips", 13: "Rice Shell Pest", 14: "Grub",
    15: "Mole Cricket", 16: "Wireworm", 17: "White Grub",
    18: "Black Cutworm", 19: "Large Cutworm", 20: "Yellow Cutworm",
    21: "Army Worm", 22: "Beet Army Worm", 23: "Yellow Tiger Moth",
    24: "Rice Leaf Roller (Alt)", 25: "Corn Borer", 26: "Meadow Moth",
    27: "Fall Webworm", 28: "Beet Webworm", 29: "Soybean Looper",
    30: "Vegetable Leaf Miner", 31: "Potato Tuberworm", 32: "Beet Fly",
    33: "Flea Beetle", 34: "Cabbage Army Worm", 35: "Beet Armyworm",
    36: "Peach Borer", 37: "Corn Earworm", 38: "Tobacco Budworm",
    39: "Bollworm", 40: "Green Stink Bug", 41: "Leaf Beetle",
    42: "Hoverfly", 43: "Aphid (Green Peach)", 44: "Aphid (Cotton)",
    45: "Whitefly", 46: "Mealybug", 47: "Thrips",
    48: "Leaf Miner", 49: "Sawfly", 50: "Scale Insect",
    51: "Fruit Fly", 52: "Citrus Psyllid", 53: "Diamondback Moth",
    54: "Codling Moth", 55: "Gypsy Moth", 56: "Bagworm",
    57: "Tent Caterpillar", 58: "Pine Caterpillar", 59: "Bark Beetle",
    60: "Longhorn Beetle", 61: "Weevil (Rice)", 62: "Weevil (Grain)",
    63: "Colorado Potato Beetle", 64: "Spotted Cucumber Beetle", 65: "Flea Beetle (Striped)",
    66: "Japanese Beetle", 67: "Ladybug (Pest)", 68: "Blister Beetle",
    69: "Stink Bug (Brown)", 70: "Squash Bug", 71: "Lygus Bug",
    72: "Chinch Bug", 73: "Seed Bug", 74: "Boxelder Bug",
    75: "Cicada", 76: "Planthopper", 77: "Leafhopper (Green)",
    78: "Treehopper", 79: "Spittlebug", 80: "Psyllid",
    81: "Greenhouse Whitefly", 82: "Silverleaf Whitefly", 83: "Woolly Aphid",
    84: "Root Aphid", 85: "Spider Mite", 86: "Red Mite",
    87: "Broad Mite", 88: "Cyclamen Mite", 89: "Tomato Hornworm",
    90: "Tobacco Hornworm", 91: "Cabbage Looper", 92: "Imported Cabbageworm",
    93: "Cross-Striped Cabbageworm", 94: "Pickleworm", 95: "Melonworm",
    95: "Melonworm", 96: "European Corn Borer", 97: "Southwestern Corn Borer",
    98: "Sugarcane Borer", 99: "Lesser Cornstalk Borer", 100: "Sod Webworm",
    101: "Cranberry Fruitworm"
}

# --- CUSTOM CSS ---
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

.stApp {
    background: linear-gradient(135deg, #0a0f0d 0%, #1a2e1a 50%, #0d1f15 100%);
    font-family: 'Inter', sans-serif;
}

/* Header styling */
h1 {
    background: linear-gradient(90deg, #4ade80, #22d3ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700 !important;
}

h2, h3 {
    color: #e2e8f0 !important;
}

/* Sidebar */
section[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0f1a14 0%, #1a2e1a 100%);
    border-right: 1px solid #2d4a3e;
}

section[data-testid="stSidebar"] .stMarkdown p,
section[data-testid="stSidebar"] .stRadio label,
section[data-testid="stSidebar"] h1, section[data-testid="stSidebar"] h2 {
    color: #a7f3d0 !important;
}

/* Card containers */
div[data-testid="column"] {
    background: rgba(15, 26, 20, 0.8);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid #2d4a3e;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Upload area */
div[data-testid="stFileUploader"] {
    background: rgba(15, 26, 20, 0.6);
    border: 2px dashed #4ade80;
    border-radius: 16px;
    padding: 1rem;
}

div[data-testid="stFileUploader"] label p {
    color: #a7f3d0 !important;
    font-size: 1.1rem !important;
}

/* Progress bars */
div[data-testid="stProgress"] > div > div {
    background: linear-gradient(90deg, #4ade80, #22d3ee) !important;
    border-radius: 10px;
}

/* Info/Success boxes */
div[data-testid="stAlert"] {
    border-radius: 12px;
}

/* General text */
.stMarkdown p, .stWrite {
    color: #cbd5e1 !important;
}
</style>
""", unsafe_allow_html=True)

# --- SIDEBAR ---
st.sidebar.markdown("## 🐛 PestAI")
st.sidebar.markdown("**Deep Learning Pest Detection**")
st.sidebar.markdown("---")
selected_model_name = st.sidebar.radio(
    "🔍 Yapay Zeka Modeli:", 
    ["🎯 EfficientNet-B4", "⚡ ViT-B/16"],
    help="EfficientNet daha hizli, ViT daha yuksek dogrulukta calisiyor."
)
show_gradcam = st.sidebar.checkbox("🔥 Grad-CAM XAI Goster", value=False)
st.sidebar.markdown("---")
st.sidebar.markdown("📊 **IP102 Dataset**")
st.sidebar.markdown("102 zararlı böcek türü")
st.sidebar.markdown("75.000+ eğitim görüntüsü")

# --- HEADER ---
st.title("🐛 Insect Pest Recognition System")
st.markdown("*IP102 veri seti ile eğitilmiş derin öğrenme tabanlı zararlı böcek teşhis sistemi*")

uploaded_file = st.file_uploader("📷 Analiz edilecek böcek fotoğrafını yükleyin", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert('RGB')

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("📸 Yüklenen Görüntü")
        st.image(image, width='stretch')

    try:
        import torch
        import numpy as np
        import cv2
        import timm
        from torchvision import transforms

        num_classes = 102

        # Load model
        with st.spinner("🧠 Model yükleniyor..."):
            if "EfficientNet" in selected_model_name:
                model = timm.create_model('efficientnet_b4', pretrained=False, num_classes=num_classes)
                model_path = 'notebooks/best_efficientnet_model.pth'
            else:
                model = timm.create_model('vit_base_patch16_224', pretrained=False, num_classes=num_classes)
                model_path = 'notebooks/best_vit_model.pth'

            if os.path.exists(model_path):
                state_dict = torch.load(model_path, map_location='cpu', weights_only=True)
                model.load_state_dict(state_dict)
                del state_dict
            model.eval()

        # Preprocess
        img_np = np.array(image)
        img_resized = cv2.resize(img_np, (224, 224))
        rgb_img_float = np.float32(img_resized) / 255.0

        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        input_tensor = transform(img_resized).unsqueeze(0)

        # Inference
        with torch.no_grad():
            outputs = model(input_tensor)
            probs = torch.nn.functional.softmax(outputs[0], dim=0)

        top3_prob, top3_idx = torch.topk(probs, 3)

        with col2:
            st.subheader("🧠 Analiz Sonuçları")
            
            pred_name = IP102_CLASSES.get(top3_idx[0].item(), f"Category {top3_idx[0].item()}")
            confidence = top3_prob[0].item() * 100
            
            st.success(f"**🎯 Teşhis: {pred_name}**")
            st.metric(label="Güven Skoru", value=f"%{confidence:.1f}")
            st.progress(float(top3_prob[0]))
            
            st.markdown("---")
            st.write("**Diğer Olasılıklar:**")
            for i in range(1, 3):
                name = IP102_CLASSES.get(top3_idx[i].item(), f"Category {top3_idx[i].item()}")
                prob = top3_prob[i].item() * 100
                st.write(f"• {name} — %{prob:.1f}")
                st.progress(float(top3_prob[i]))

        # Grad-CAM
        if show_gradcam:
            st.markdown("---")
            st.subheader("🔍 Explainable AI — Grad-CAM Isı Haritası")
            st.markdown("*Model bu kararı verirken resmin neresine odaklandı?*")
            with st.spinner("Isı haritası oluşturuluyor..."):
                try:
                    from pytorch_grad_cam import GradCAM
                    from pytorch_grad_cam.utils.image import show_cam_on_image

                    if "EfficientNet" in selected_model_name:
                        target_layers = [model.conv_head]
                        cam = GradCAM(model=model, target_layers=target_layers)
                    else:
                        def reshape_transform(tensor, height=14, width=14):
                            result = tensor[:, 1:, :].reshape(tensor.size(0), height, width, tensor.size(2))
                            result = result.transpose(2, 3).transpose(1, 2)
                            return result
                        target_layers = [model.blocks[-1].norm1]
                        cam = GradCAM(model=model, target_layers=target_layers, reshape_transform=reshape_transform)

                    grayscale_cam = cam(input_tensor=input_tensor, targets=None)[0, :]
                    vis = show_cam_on_image(rgb_img_float, grayscale_cam, use_rgb=True)

                    gcol1, gcol2, gcol3 = st.columns([1, 2, 1])
                    with gcol2:
                        st.image(vis, caption="🔥 Kırmızı = Yüksek Odaklanma", width='stretch')
                        st.info("💡 Kırmızı bölgeler modelin teşhis için en çok dikkat ettiği alanlardır.")
                except Exception as e:
                    st.error(f"Grad-CAM hatası: {e}")

        # Cleanup
        del model
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    except Exception as e:
        st.error(f"Hata oluştu: {e}")
        import traceback
        st.code(traceback.format_exc())
