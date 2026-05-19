from rest_framework import serializers
from .models import Menu_Module , Menu_Child, Customer, Service, Invoice, InvoiceItem, UserProfile
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User, Group, Permission



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

        # Note: Doesnt include 'invoice' here because  it Doesn't know the invoice ID until the parent is created!

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

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)
                
        return instance

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

#--------------- User Group Serializer-------------#

class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), required=False
    )
    users = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'users']

    def get_users(self, obj):
        return [{"id": user.id, "username": user.username, "email": user.email} for user in obj.user_set.all()]

        # Group permission Serializer

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

#------------------User Serializer------------------#

class UserRegistrationSerializer(serializers.ModelSerializer):
    role_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role_id']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value    

    def create(self, validated_data):
        role_id = validated_data.pop('role_id')
        validated_data['password'] = make_password(validated_data['password'])
        user = User.objects.create(**validated_data)
        try:
            group = Group.objects.get(id=role_id)
            user.groups.add(group)
        except Group.DoesNotExist:
            pass 
            
        return user

#------------------Current User Profile Serializer------------------#

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_picture']

class CurrentUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile']

    def get_role(self, obj):
        group = obj.groups.first()
        return group.name if group else "User"

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        
        password = self.context.get('request').data.get('password')
        if password:
            old_password = self.context.get('request').data.get('oldPassword')
            if not old_password:
                raise serializers.ValidationError({"oldPassword": "Old password is required to set a new password."})
            if not instance.check_password(old_password):
                raise serializers.ValidationError({"oldPassword": "The old password you entered is incorrect."})
            instance.set_password(password)

        instance.save()

        profile_picture = self.context.get('request').FILES.get('profile_picture')
        if profile_picture:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            profile.profile_picture = profile_picture
            profile.save()

        return instance