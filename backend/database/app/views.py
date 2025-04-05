# app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import WasteStatistics
from .serializers import WasteStatisticsSerializer

class WasteStatisticsView(APIView):
    def get(self, request, pk=None):
        if pk:
            try:
                stats = WasteStatistics.objects.get(pk=pk)
                serializer = WasteStatisticsSerializer(stats)
                return Response(serializer.data)
            except WasteStatistics.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        else:
            stats = WasteStatistics.objects.all()
            serializer = WasteStatisticsSerializer(stats, many=True)
            return Response(serializer.data)
