from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Menu_Module, Customer, Service, Invoice
from django.contrib.auth.models import User, Group, Permission
from .serializers import ModuleSerializer, CustomerSerializer, ServiceSerializer, InvoiceSerializer, UserRegistrationSerializer, GroupSerializer, PermissionSerializer, CurrentUserSerializer, UserAdminSerializer
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics , permissions
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Invoice

# --------------Module Views--------------#

class SidebarMenuView(APIView):
    def get(self, request):
        modules = Menu_Module.objects.all()
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

    permission_classes = [IsAuthenticated]

# --------------Customer Views--------------#

class CustomerListCreateView(generics.ListCreateAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]


#---------------Service Views--------------#

class ServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

class ServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]


#--------------Invoice Views--------------#


class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


class AddInvoicePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        from decimal import Decimal
        from rest_framework import status
        from django.utils import timezone
        
        invoice = get_object_or_404(Invoice, pk=pk)
        amount_raw = request.data.get('amount')
        
        if amount_raw is None:
            return Response(
                {"error": "Payment amount is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            payment_amount = Decimal(str(amount_raw))
        except Exception:
            return Response(
                {"error": "Invalid payment amount format."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if payment_amount <= 0:
            return Response(
                {"error": "Payment amount must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST
            )
          
        outstanding = invoice.total_amount - invoice.amount_paid
        
        outstanding = outstanding.quantize(Decimal('0.01'))
        payment_amount = payment_amount.quantize(Decimal('0.01'))
        
        if payment_amount > outstanding:
            return Response(
                {"error": f"Payment amount of {payment_amount} exceeds outstanding balance of {outstanding}."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        invoice.amount_paid += payment_amount
        invoice.save()
        
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


#--------------User Group Views--------------#


class GroupCreateView(generics.CreateAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]

class GroupListView(generics.ListAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]

class GroupUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAdminUser]

class PermissionListView(generics.ListAPIView):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]

#---------------User View ------------------------#

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAuthenticated]

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

class UserAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_destroy(self, instance):
        if instance.is_superuser and not self.request.user.is_superuser:
            raise PermissionDenied("Only superusers can delete superuser accounts.")
        instance.delete()




#----------------------------------------------------------------#
