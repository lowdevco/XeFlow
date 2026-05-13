from rest_framework import serializers
from .models import Menu_Module , Menu_Child

class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu_Child
        fields = ['id', 'name', 'url']

class ModuleSerializer(serializers.ModelSerializer):
    children = ChildSerializer(many=True, read_only=True)

    class Meta:
        model = Menu_Module
        fields = ['id', 'name', 'icon', 'url', 'children']