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
from django.core.mail import send_mail, EmailMessage
import base64

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

    def perform_destroy(self, instance):
        try:
            if instance.profile.is_superuser:
                raise PermissionDenied("Cannot delete the user group with superuser access.")
        except AttributeError:
            pass
        instance.delete()


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
        if instance.is_superuser:
            if not self.request.user.is_superuser:
                raise PermissionDenied("Only superusers can delete superuser accounts.")

            # Prevent deleting the last superuser
            superusers = User.objects.filter(is_superuser=True)
            if superusers.count() <= 1 and superusers.filter(id=instance.id).exists():
                raise PermissionDenied("Cannot delete the last remaining superuser.")
        instance.delete()



#---------------------Email (mailtrap) -------------------------#


class MailSystem(APIView):
    permission_classes = []

    def get(self, request):
        recipient = request.query_params.get('email', 'test.mailtrap1234@gmail.com')
        send_mail(
            subject='Example Subject',
            message='Message body',
            from_email="django@mailtrap.club",
            recipient_list=[recipient],
            fail_silently=False,
        )
        return Response({'message': f'Message Sent to {recipient}!'})

    def post(self, request):
        recipient = request.data.get('email', 'test.mailtrap1234@gmail.com')
        cc = request.data.get('cc', '')
        bcc = request.data.get('bcc', '')
        subject = request.data.get('subject', 'Example Subject')
        message = request.data.get('message', 'Message body')
        pdf_base64 = request.data.get('pdf', '')
        filename = request.data.get('filename', 'Invoice.pdf')

        cc_list = [c.strip() for c in cc.split(',')] if cc else []
        bcc_list = [b.strip() for b in bcc.split(',')] if bcc else []

        email = EmailMessage(
            subject=subject,
            body=message,
            from_email="django@mailtrap.club",
            to=[recipient],
            cc=cc_list,
            bcc=bcc_list,
        )

        if pdf_base64:
            try:
                pdf_data = base64.b64decode(pdf_base64)
                email.attach(filename, pdf_data, 'application/pdf')
            except Exception as e:
                return Response({'error': f'Failed to parse PDF attachment: {str(e)}'}, status=400)

        try:
            email.send(fail_silently=False)
            return Response({'message': f'Message Sent to {recipient}!'})
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=500)


#----------------------------------------------------------------#
