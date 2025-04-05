from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class WasteStatistics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waste_stats')
    cardboard = models.IntegerField(default=0)
    food_organics = models.IntegerField(default=0)
    glass = models.IntegerField(default=0)
    metal = models.IntegerField(default=0)
    miscellaneous_trash = models.IntegerField(default=0)
    paper = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'app'
    
    def __str__(self):
        return f"Stats for {self.user.username}"
