from django.urls import path
from .views import SidebarMenuView, CustomerListCreateView, CustomerDetailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView   

urlpatterns = [
    path('sidebar/', SidebarMenuView.as_view(), name='api-sidebar'),
    path('customers/', CustomerListCreateView.as_view(), name='api-customers'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='api-customer-detail'),

]