from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.statistics_dashboard, name='stats'),
    path('stats/delete/', views.delete_statistics, name='delete_stats'),
    path('users/', views.list_users, name='list_users'),
]