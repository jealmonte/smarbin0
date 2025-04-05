# app/serializers.py
from rest_framework import serializers
from .models import WasteStatistics, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'supabase_uid', 'email', 'created_at']

class WasteStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteStatistics
        fields = '__all__'  # Or specify the fields you need
