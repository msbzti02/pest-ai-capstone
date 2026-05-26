import os
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
os.environ['OMP_NUM_THREADS'] = '1'

import cv2
import torch
import numpy as np
import timm
from PIL import Image
from torchvision import transforms
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io
import cv2
import base64
import threading
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend safe for server threads
import matplotlib.pyplot as plt

from lime import lime_image
from skimage.segmentation import mark_boundaries
import shap

app = FastAPI(title="PestAI ML Service", version="1.0")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Class names mapping ---
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
    96: "European Corn Borer", 97: "Southwestern Corn Borer",
    98: "Sugarcane Borer", 99: "Lesser Cornstalk Borer", 100: "Sod Webworm",
    101: "Cranberry Fruitworm"
}

# --- Thread-Safe Lazy Model Cache ---
MODELS = {}
MODELS_LOCK = threading.Lock()
NUM_CLASSES = 102

def get_model(model_name: str, is_quantized: bool = False):
    cache_key = f"{model_name}_quantized" if is_quantized else model_name
    if cache_key in MODELS:
        return MODELS[cache_key]
    
    with MODELS_LOCK:
        if cache_key in MODELS:
            return MODELS[cache_key]
            
        print(f"[*] Loading model weight file for: {cache_key}...")
        if model_name == 'efficientnet':
            model = timm.create_model('efficientnet_b4', pretrained=False, num_classes=NUM_CLASSES)
            base_name = 'best_efficientnet_model.pth'
            model_path = f'../notebooks/{base_name}'
            if not os.path.exists(model_path):
                model_path = f'notebooks/{base_name}'
        elif model_name == 'vit':
            model = timm.create_model('vit_base_patch16_224', pretrained=False, num_classes=NUM_CLASSES)
            base_name = 'best_vit_model.pth'
            model_path = f'../notebooks/{base_name}'
            if not os.path.exists(model_path):
                model_path = f'notebooks/{base_name}'
        
        # 1. Load weights in FP32
        if os.path.exists(model_path):
            state_dict = torch.load(model_path, map_location='cpu', weights_only=True)
            model.load_state_dict(state_dict)
            print(f"[+] Loaded weights from {model_path}")
        else:
            print(f"[!] Warning: Model weights not found at {model_path}. Using uninitialized model.")
            
        # 2. Apply Dynamic Quantization AFTER loading weights
        if is_quantized:
            import torch.ao.quantization as ao_quant
            print(f"[*] Applying INT8 Dynamic Quantization to {cache_key} for faster CPU inference...")
            model = ao_quant.quantize_dynamic(
                model, {torch.nn.Linear}, dtype=torch.qint8
            )
        
        model.eval()
        MODELS[cache_key] = model
        return model

# Image transforms (Standard ImageNet mean/std normalization)
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def array_to_base64(img_array):
    """Converts a RGB numpy array (0-255 or 0-1) to base64 jpeg string."""
    if img_array.max() <= 1.0:
        img_array = (img_array * 255).astype(np.uint8)
    else:
        img_array = img_array.astype(np.uint8)
    
    pil_img = Image.fromarray(img_array)
    buffered = io.BytesIO()
    pil_img.save(buffered, format="JPEG", quality=90)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ml_service"}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model_name: str = Form("efficientnet"),
    lime_samples: int = Form(200),
    lime_features: int = Form(5),
    gradcam_opacity: float = Form(0.5),
    shap_evals: int = Form(100),
    is_quantized: str = Form("false")
):
    try:
        is_q = is_quantized.lower() == 'true'
        image_bytes = await file.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        img_np = np.array(pil_image)
        img_resized = cv2.resize(img_np, (224, 224))
        rgb_img_float = np.float32(img_resized) / 255.0
        
        input_tensor = transform(img_resized).unsqueeze(0)
        
        model = get_model(model_name, is_quantized=is_q)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probs = torch.nn.functional.softmax(outputs[0], dim=0)
        
        top3_prob, top3_idx = torch.topk(probs, 3)
        predictions = []
        for i in range(3):
            class_id = top3_idx[i].item()
            prob = top3_prob[i].item()
            predictions.append({
                "class_id": class_id,
                "label": IP102_CLASSES.get(class_id, f"Category {class_id}"),
                "confidence": prob * 100
            })
            
        top_prediction = predictions[0]
        original_b64 = array_to_base64(img_resized)
        
        gradcam_b64 = None
        lime_b64 = None
        shap_b64 = None
        
        # --- 1. Compute Grad-CAM ---
        try:
            if is_q:
                print("[*] Skipping Grad-CAM: Gradients are not supported on INT8 quantized models.")
            else:
                from pytorch_grad_cam import GradCAM
                from pytorch_grad_cam.utils.image import show_cam_on_image

                if "efficientnet" in model_name.lower():
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
                vis = show_cam_on_image(rgb_img_float, grayscale_cam, use_rgb=True, image_weight=gradcam_opacity)
                gradcam_b64 = array_to_base64(vis)
        except Exception as e:
            print(f"[!] Grad-CAM error: {e}")
            
        # --- 2. Compute LIME ---
        try:
            def batch_predict(images):
                model.eval()
                batch_tensors = []
                for img in images:
                    pil_img = Image.fromarray(img)
                    tensor = transform(pil_img)
                    batch_tensors.append(tensor)
                
                batch = torch.stack(batch_tensors, dim=0)
                with torch.no_grad():
                    logits = model(batch)
                    probs_batch = torch.nn.functional.softmax(logits, dim=1)
                return probs_batch.cpu().numpy()
            
            explainer = lime_image.LimeImageExplainer(random_state=42)
            explanation = explainer.explain_instance(
                img_resized,
                batch_predict,
                top_labels=3,
                hide_color=0,
                num_samples=lime_samples
            )
            
            top_label_id = top_prediction["class_id"]
            segments = explanation.segments
            local_exp = explanation.local_exp[top_label_id]
            
            top_features = local_exp[:lime_features]
            
            pos_mask = np.zeros(segments.shape, dtype=bool)
            neg_mask = np.zeros(segments.shape, dtype=bool)
            
            for f_id, weight in top_features:
                if weight > 0:
                    pos_mask[segments == f_id] = True
                else:
                    neg_mask[segments == f_id] = True
            
            lime_visual = rgb_img_float.copy()
            lime_visual = mark_boundaries(lime_visual, pos_mask, color=(0, 1, 0)) 
            lime_visual = mark_boundaries(lime_visual, neg_mask, color=(1, 0, 0)) 
            lime_b64 = array_to_base64(lime_visual)
            
        except Exception as e:
            print(f"[!] LIME error: {e}")
            
        # --- 3. Compute SHAP ---
        try:
            top_class_id = top_prediction["class_id"]
            def shap_predict(images):
                model.eval()
                batch_tensors = []
                for img in images:
                    pil_img = Image.fromarray(img.astype(np.uint8))
                    tensor = transform(pil_img)
                    batch_tensors.append(tensor)
                batch = torch.stack(batch_tensors, dim=0)
                with torch.no_grad():
                    logits = model(batch)
                    probs_batch = torch.nn.functional.softmax(logits, dim=1)
                # Only return the probability of the top predicted class to prevent a 102-column squished plot
                return probs_batch[:, top_class_id:top_class_id+1].cpu().numpy()

            # Detailed SHAP using inpaint_telea for organic superpixels instead of a blocky grid
            masker = shap.maskers.Image("inpaint_telea", img_resized.shape)
            shap_explainer = shap.Explainer(shap_predict, masker, output_names=[top_prediction["label"]])
            
            # Use dynamic evaluations (default 100) for detailed map
            shap_values = shap_explainer(np.expand_dims(img_resized, axis=0), max_evals=shap_evals, batch_size=10)
            
            plt.figure(figsize=(6, 4))
            shap.image_plot(shap_values, show=False)
            fig = plt.gcf()
            
            buf = io.BytesIO()
            fig.savefig(buf, format="jpeg", bbox_inches='tight', pad_inches=0.1)
            plt.close('all')
            shap_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        except Exception as e:
            print(f"[!] SHAP error: {e}")
            import traceback
            traceback.print_exc()

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        return {
            "predictions": predictions,
            "images": {
                "original": original_b64,
                "gradcam": gradcam_b64,
                "lime": lime_b64,
                "shap": shap_b64
            }
        }
        
    except Exception as e:
        import traceback
        error_msg = f"Inference pipeline failed: {str(e)}"
        print(f"[!] {error_msg}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
