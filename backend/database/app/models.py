from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class User(models.Model):
    supabase_uid = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email or self.supabase_uid

class WasteStatistics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waste_statistics', null=True)
    paper = models.IntegerField(default=0)
    glass = models.IntegerField(default=0)
    food_organics = models.IntegerField(default=0)
    metal = models.IntegerField(default=0)
    cardboard = models.IntegerField(default=0)
    miscellaneous_trash = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Waste Statistics for {self.user.email if self.user else 'Anonymous'}"
