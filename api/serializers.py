from rest_framework import serializers
from .models import Menu_Module , Menu_Child, Customer, Service, Invoice, InvoiceItem


#--------------Module Serializer---------------#

class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu_Child
        fields = ['id', 'name', 'url']

class ModuleSerializer(serializers.ModelSerializer):
    children = ChildSerializer(many=True, read_only=True)

    class Meta:
        model = Menu_Module
        fields = ['id', 'name', 'icon', 'url', 'children']

#--------------Customer Serializer---------------#  

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

#--------------Service Seria;izer--------------#

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

#--------------invoice Serializer----------------#

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['service', 'description', 'quantity', 'rate', 'amount']
        # Note: Doesnt include 'invoice' here because don't know the invoice ID until the parent is created!

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True) 

    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice

    def to_representation(self, instance):
        response = super().to_representation(instance)
        if instance.customer:
            response['customer'] = {
                'id': instance.customer.id,
                'company_name': instance.customer.company_name,
                'rep_name': instance.customer.rep_name,
                'email': instance.customer.email,
                'phone': instance.customer.phone
            }
        return response