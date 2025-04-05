from django.urls import path
from .views import WasteStatisticsView

urlpatterns = [
    path('waste-statistics/', WasteStatisticsView.as_view(), name='waste-statistics-list'),
    path('waste-statistics/<int:pk>/', WasteStatisticsView.as_view(), name='waste-statistics-detail'),
]
