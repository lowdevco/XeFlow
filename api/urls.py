from django.urls import path
from .views import SidebarMenuView, CustomerListCreateView, CustomerDetailView, ServiceListCreateView, ServiceDetailView, InvoiceListCreateView, InvoiceDetailView, download_invoice_pdf
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView   

urlpatterns = [
    path('sidebar/', SidebarMenuView.as_view(), name='api-sidebar'),
    path('customers/', CustomerListCreateView.as_view(), name='api-customers'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    path('services/', ServiceListCreateView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list-create'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('invoices/<int:pk>/pdf/', download_invoice_pdf, name='invoice-pdf'),

]