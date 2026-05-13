from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Menu_Module
from .serializers import ModuleSerializer

class SidebarMenuView(APIView):
    def get(self, request):
        modules = Menu_Module.objects.all()
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)