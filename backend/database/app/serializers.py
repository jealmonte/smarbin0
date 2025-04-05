# app/serializers.py
from rest_framework import serializers
from .models import WasteStatistics

class WasteStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteStatistics
        fields = '__all__'  # Or specify the fields you need
