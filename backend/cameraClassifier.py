import cv2
import torch
import numpy as np
from torchvision import transforms, models
import torch.nn as nn
from PIL import Image
import time
import json
import os
import sys
import django
import matplotlib.pyplot as plt
import argparse
import signal

# Add the path to your Django project
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'database'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'database.settings')
django.setup()

# Import Django models
from django.contrib.auth.models import User
from app.models import WasteStatistics, User as CustomUser

class WasteClassifier:
    def __init__(self, model_path, categories_path, supabase_uid=None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_path = os.path.join(current_dir, model_path)
        self.categories_path = os.path.join(current_dir, categories_path)
        self.categories = torch.load(self.categories_path)
        self.model = self.load_model(self.model_path, len(self.categories))
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        self.stats = {category: 0 for category in self.categories}
        self.supabase_uid = supabase_uid
    
    def load_model(self, model_path, num_classes):
        model = models.resnet50(pretrained=False)
        num_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, num_classes)
        )
        model.load_state_dict(torch.load(model_path, map_location=self.device))
        model.to(self.device)
        model.eval()
        return model
    
    def preprocess_image(self, image):
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image_rgb)
        tensor_image = self.transform(pil_image)
        tensor_image = tensor_image.unsqueeze(0)
        return tensor_image
    
    def predict(self, image):
        tensor_image = self.preprocess_image(image)
        tensor_image = tensor_image.to(self.device)
        
        with torch.no_grad():
            outputs = self.model(tensor_image)
            _, predicted = torch.max(outputs, 1)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
        
        class_idx = predicted.item()
        confidence = probabilities[0][class_idx].item()
        
        return self.categories[class_idx], confidence
    
    def update_stats(self, category):
        self.stats[category] += 1
        
        if not self.supabase_uid:
            print("No Supabase user ID provided, skipping database update")
            self.save_stats()
            return
            
        try:
            # Get the user by supabase_uid instead of Django user ID
            user = CustomUser.objects.get(supabase_uid=self.supabase_uid)
            stats, created = WasteStatistics.objects.get_or_create(user=user)
            
            # Convert category name to database field name (e.g., "Food Organics" -> "food_organics")
            field_name = category.lower().replace(' ', '_')
            
            # Check if the field exists in the model
            if hasattr(stats, field_name):
                # Get current value and increment by 1
                current_value = getattr(stats, field_name)
                setattr(stats, field_name, current_value + 1)
                stats.save()
                print(f"Updated database stats for {category} (user: {user.email})")
            else:
                print(f"Warning: Field {field_name} not found in WasteStatistics model")
                
        except CustomUser.DoesNotExist:
            print(f"Error: User with Supabase ID {self.supabase_uid} not found")
        except Exception as e:
            print(f"Error updating database: {e}")
            
        self.save_stats()
    
    def save_stats(self):
        with open(os.path.join(current_dir, 'waste_stats.json'), 'w') as f:
            json.dump(self.stats, f)

cap = None
classifier = None

def handle_termination(signum, frame):
    global cap, classifier  # Add classifier here
    print("Termination signal received, shutting down...")
    if cap is not None:
        cap.release()
    
    # Save stats before exiting
    if classifier is not None:
        classifier.save_stats()
        
    plt.close('all')
    sys.exit(0)

# Register signal handlers
signal.signal(signal.SIGTERM, handle_termination)
signal.signal(signal.SIGINT, handle_termination)

def start_camera_classification(supabase_uid=None):
    global cap, classifier
    # If supabase_uid is provided, use it; otherwise, use a test user
    if supabase_uid:
        try:
            # Get the user by supabase_uid
            from app.models import User
            user = User.objects.get(supabase_uid=supabase_uid)
            print(f"Using authenticated user with Supabase ID: {supabase_uid}")
        except Exception as e:
            print(f"Error finding user with Supabase ID {supabase_uid}: {e}")
            # Continue with default user
            user, created = User.objects.get_or_create(username='testuser')
    else:
        # Fallback to test user
        user, created = User.objects.get_or_create(username='testuser')
        print(f"No Supabase ID provided, using {'new ' if created else ''}test user with ID: {user.id}")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return
    
    classifier = WasteClassifier('best_waste_classifier.pth', 'waste_categories.pth', supabase_uid)
    
    bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=16, detectShadows=True)
    min_contour_area = 5000
    confidence_threshold = 0.7
    initial_cooldown = 4  # 4 seconds before first scan
    subsequent_cooldown = 12  # 12 seconds before second scan
    last_detection_time = 0
    is_first_scan = True
    
    plt.figure(figsize=(10, 8))
    plt.ion()
    
    print("Camera started. Press 'q' to quit.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to capture image")
            break
        
        fg_mask = bg_subtractor.apply(frame)
        _, thresh = cv2.threshold(fg_mask, 244, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        motion_detected = False
        for contour in contours:
            if cv2.contourArea(contour) > min_contour_area:
                motion_detected = True
                break
        
        current_time = time.time()
        cooldown = initial_cooldown if is_first_scan else subsequent_cooldown
        
        if motion_detected and current_time - last_detection_time > cooldown:
            predicted_class, confidence = classifier.predict(frame)
            
            if confidence >= confidence_threshold:
                text = f"{predicted_class}: {confidence:.2f}"
                cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                print(f"Detected: {predicted_class} with confidence {confidence:.2f}")
                classifier.update_stats(predicted_class)
                print(f"Action: Moving item to {predicted_class} bin")
                last_detection_time = current_time
                is_first_scan = False
            else:
                print(f"Low confidence detection ({confidence:.2f}), ignoring")
        
        plt.clf()
        plt.imshow(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        plt.title('Waste Classification')
        plt.axis('off')
        plt.draw()
        plt.pause(0.001)
        
        if plt.waitforbuttonpress(timeout=0.01):
            break
    
    cap.release()
    plt.close('all')
    
    if supabase_uid:
        try:
            user = CustomUser.objects.get(supabase_uid=supabase_uid)
            stats = WasteStatistics.objects.get(user=user)
            print("\nFinal Statistics from Database:")
            print(f"Cardboard: {stats.cardboard}")
            print(f"Food Organics: {stats.food_organics}")
            print(f"Glass: {stats.glass}")
            print(f"Metal: {stats.metal}")
            print(f"Miscellaneous Trash: {stats.miscellaneous_trash}")
            print(f"Paper: {stats.paper}")
        except Exception as e:
            print(f"Error retrieving final statistics: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run waste classification camera')
    parser.add_argument('--supabase_uid', type=str, help='Supabase user ID')
    args = parser.parse_args()
    
    start_camera_classification(args.supabase_uid)
