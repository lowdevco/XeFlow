from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Menu_Module, Customer
from .serializers import ModuleSerializer, CustomerSerializer
from rest_framework import generics 
from rest_framework.permissions import IsAuthenticated

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

class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer