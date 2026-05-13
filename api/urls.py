from django.urls import path
from .views import SidebarMenuView

urlpatterns = [
    path('sidebar/', SidebarMenuView.as_view(), name='api-sidebar'),
]