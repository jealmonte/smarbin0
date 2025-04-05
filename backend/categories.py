import torch

categories = ['cardboard', 'food organics', 'glass', 'metal', 'miscellaneous trash', 'paper']
torch.save(categories, 'waste_categories.pth')