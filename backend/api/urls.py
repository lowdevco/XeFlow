from django.urls import path
from .views import SidebarMenuView, CustomerListCreateView, CustomerDetailView, ServiceListCreateView, ServiceDetailView, InvoiceListCreateView, InvoiceDetailView, AddInvoicePaymentView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView   
from .views import UserRegistrationView, GroupCreateView, GroupListView, PermissionListView,GroupUpdateDeleteView, CurrentUserView, UserListView, UserAdminDetailView

urlpatterns = [
    path('sidebar/', SidebarMenuView.as_view(), name='api-sidebar'),
    path('customers/', CustomerListCreateView.as_view(), name='api-customers'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    path('services/', ServiceListCreateView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),
    path('invoices/', InvoiceListCreateView.as_view(), name='invoice-list-create'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('invoices/<int:pk>/payment/', AddInvoicePaymentView.as_view(), name='invoice-payment'),
    path('users/register/', UserRegistrationView.as_view(), name='user-register'),
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserAdminDetailView.as_view(), name='user-admin-detail'),
    path('groups/', GroupListView.as_view(), name='group-list'),
    path('groups/create/', GroupCreateView.as_view(), name='group-create'),
    path('permissions/', PermissionListView.as_view(), name='permission-list'),
    path('groups/<int:pk>/',GroupUpdateDeleteView.as_view(), name='group-detail'),
]