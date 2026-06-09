import os
import cv2
# OpenCV multithreading'i açıyoruz (num_workers=0 kullandığımız için)
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
import albumentations as A
from albumentations.pytorch import ToTensorV2
from collections import Counter
import matplotlib.pyplot as plt

class IP102Dataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        
        # Sort classes numerically rather than lexicographically
        self.classes = sorted([
            d for d in os.listdir(root_dir) 
            if os.path.isdir(os.path.join(root_dir, d)) and not d.startswith('.')
        ], key=lambda x: int(x))
        
        self.image_paths = []
        self.labels = []
        
        for label, class_name in enumerate(self.classes):
            class_path = os.path.join(root_dir, class_name)
            for image_name in os.listdir(class_path):
                if image_name.startswith('.'): continue
                image_path = os.path.join(class_path, image_name)
                self.image_paths.append(image_path)
                self.labels.append(label)

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        label = self.labels[idx]
        
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        if self.transform:
            augmented = self.transform(image=image)
            image = augmented["image"]
            
        return image, label

def get_transforms(img_size=224):
    """
    Advanced augmentation pipeline for ViT and long-tail/noisy datasets.
    """
    mean = (0.485, 0.456, 0.406)
    std = (0.229, 0.224, 0.225)

    train_transform = A.Compose([
        A.Resize(img_size, img_size), # Ağır Pad/Crop yerine direkt Resize (HIZ İÇİN)
        A.HorizontalFlip(p=0.5),
        A.ShiftScaleRotate(shift_limit=0.05, scale_limit=0.1, rotate_limit=15, p=0.3), # Daha hafif
        A.RandomBrightnessContrast(p=0.2), # Karmaşık OneOf bloklarını kaldırdık
        A.Normalize(mean=mean, std=std),
        ToTensorV2()
    ])

    val_transform = A.Compose([
        A.Resize(img_size, img_size),
        A.Normalize(mean=mean, std=std),
        ToTensorV2()
    ])

    return train_transform, val_transform

def get_dataloaders(data_dir, img_size=224, batch_size=32, num_workers=0):
    train_dir = os.path.join(data_dir, 'train')
    val_dir = os.path.join(data_dir, 'val')
    test_dir = os.path.join(data_dir, 'test')
    
    train_transform, val_transform = get_transforms(img_size)
    
    train_dataset = IP102Dataset(train_dir, transform=train_transform)
    val_dataset = IP102Dataset(val_dir, transform=val_transform)
    test_dataset = IP102Dataset(test_dir, transform=val_transform)
    
    train_labels = train_dataset.labels
    class_counts = Counter(train_labels)
    
    class_weights = {cls: 1.0 / count for cls, count in class_counts.items()}
    sample_weights = [class_weights[label] for label in train_labels]
    
    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )
    
    # Windows'ta multiprocessing overhead'i engellemek için num_workers=0'a geri çektik. 
    # OpenCV multithreading'i açtığımız için hızlanacak.
    train_loader = DataLoader(train_dataset, batch_size=batch_size, sampler=sampler, num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)
    
    return train_loader, val_loader, test_loader, len(train_dataset.classes)

def visualize_augmentations(dataset, num_samples=5):
    """Denormalize and visualize sample images."""
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    
    plt.figure(figsize=(15, 3 * num_samples))
    for i in range(num_samples):
        img_tensor, label = dataset[np.random.randint(len(dataset))]
        img = img_tensor.permute(1, 2, 0).numpy()
        img = std * img + mean
        img = np.clip(img, 0, 1)
        
        plt.subplot(num_samples, 1, i+1)
        plt.imshow(img)
        plt.title(f"Class: {label}")
        plt.axis('off')
    plt.tight_layout()
    plt.show()
