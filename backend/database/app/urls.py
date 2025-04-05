from django.urls import path
from .views import WasteStatisticsView, UserAuthView, StartCameraView, StopCameraView

urlpatterns = [
    path('waste-statistics/', WasteStatisticsView.as_view(), name='waste-statistics-list'),
    path('waste-statistics/<int:pk>/', WasteStatisticsView.as_view(), name='waste-statistics-detail'),
    path('auth/user/', UserAuthView.as_view(), name='user-auth'),
    path('start-camera/', StartCameraView.as_view(), name='start-camera'),
    path('stop-camera/', StopCameraView.as_view(), name='stop-camera'),
]
