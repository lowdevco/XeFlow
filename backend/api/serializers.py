from rest_framework import serializers
from .models import Menu_Module , Menu_Child, Customer, Service, Invoice, InvoiceItem, UserProfile, GroupProfile, Payment
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User, Group, Permission
from decimal import Decimal



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


#--------------Payment Serializer--------------#

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

#--------------invoice Serializer----------------#

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['service', 'description', 'quantity', 'rate', 'amount']

        # Note: Doesnt include 'invoice' here because  it Doesn't know the invoice ID until the parent is created!

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True) 
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        discount_percentage = Decimal(str(validated_data.get('discount_percentage', '0.00')))
        discount_amount = Decimal(str(validated_data.get('discount_amount', '0.00')))
        cgst_rate = Decimal(str(validated_data.get('cgst_rate', '0.00')))
        sgst_rate = Decimal(str(validated_data.get('sgst_rate', '0.00')))
        igst_rate = Decimal(str(validated_data.get('igst_rate', '0.00')))
        amount_paid = Decimal(str(validated_data.get('amount_paid', '0.00')))
        tax_type = validated_data.get('tax_type', 'GST')
        
        subtotal = Decimal('0.00')
        calculated_items = []
        for item in items_data:
            qty = Decimal(str(item.get('quantity', '1.00')))
            rate = Decimal(str(item.get('rate', '0.00')))
            amount = qty * rate
            item['amount'] = amount
            subtotal += amount
            calculated_items.append(item)
            
        if discount_percentage > 0:
            discount_amount = subtotal * (discount_percentage / Decimal('100.00'))
        else:
            if subtotal > 0:
                discount_percentage = (discount_amount / subtotal) * Decimal('100.00')
            else:
                discount_percentage = Decimal('0.00')
                
        taxable_amount = subtotal - discount_amount
        
        cgst_amount = Decimal('0.00')
        sgst_amount = Decimal('0.00')
        igst_amount = Decimal('0.00')
        
        if tax_type == 'GST':
            cgst_amount = taxable_amount * (cgst_rate / Decimal('100.00'))
            sgst_amount = taxable_amount * (sgst_rate / Decimal('100.00'))
            igst_rate = Decimal('0.00')
        elif tax_type == 'IGST':
            igst_amount = taxable_amount * (igst_rate / Decimal('100.00'))
            cgst_rate = Decimal('0.00')
            sgst_rate = Decimal('0.00')
        elif tax_type == 'No GST':
            cgst_rate = Decimal('0.00')
            sgst_rate = Decimal('0.00')
            igst_rate = Decimal('0.00')
            
        total_amount = taxable_amount + cgst_amount + sgst_amount + igst_amount
        balance_due = total_amount - amount_paid
        
        # Update validated_data with calculated values

        validated_data['subtotal'] = subtotal
        validated_data['discount_percentage'] = discount_percentage
        validated_data['discount_amount'] = discount_amount
        validated_data['cgst_rate'] = cgst_rate
        validated_data['sgst_rate'] = sgst_rate
        validated_data['igst_rate'] = igst_rate
        validated_data['cgst_amount'] = cgst_amount
        validated_data['sgst_amount'] = sgst_amount
        validated_data['igst_amount'] = igst_amount
        validated_data['total_amount'] = total_amount
        validated_data['balance_due'] = balance_due
        
        invoice = Invoice.objects.create(**validated_data)
        for item_data in calculated_items:
            InvoiceItem.objects.create(invoice=invoice, **item_data)

        # Payment Sync Logic for Create
        if amount_paid > 0:
            from django.utils import timezone
            issue_date = validated_data.get('issue_date', timezone.now().date())
            current_time = timezone.now().time()
            payment_datetime = timezone.datetime.combine(issue_date, current_time)
            payment_datetime = timezone.make_aware(payment_datetime, timezone.get_current_timezone())
            Payment.objects.create(
                invoice=invoice,
                amount=amount_paid,
                transaction_id='',
                description="Initial payment recorded on invoice creation",
                payment_date=payment_datetime
            )

        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        tax_type = validated_data.get('tax_type', instance.tax_type)
        discount_percentage = Decimal(str(validated_data.get('discount_percentage', instance.discount_percentage)))
        discount_amount = Decimal(str(validated_data.get('discount_amount', instance.discount_amount)))
        cgst_rate = Decimal(str(validated_data.get('cgst_rate', instance.cgst_rate)))
        sgst_rate = Decimal(str(validated_data.get('sgst_rate', instance.sgst_rate)))
        igst_rate = Decimal(str(validated_data.get('igst_rate', instance.igst_rate)))
        amount_paid = Decimal(str(validated_data.get('amount_paid', instance.amount_paid)))
        
        subtotal = Decimal('0.00')
        calculated_items = []
        if items_data is not None:
            for item in items_data:
                qty = Decimal(str(item.get('quantity', '1.00')))
                rate = Decimal(str(item.get('rate', '0.00')))
                amount = qty * rate
                item['amount'] = amount
                subtotal += amount
                calculated_items.append(item)
        else:
            # Recompute subtotal from existing database items

            for db_item in instance.items.all():
                subtotal += Decimal(str(db_item.quantity)) * Decimal(str(db_item.rate))
                
        if discount_percentage > 0:
            discount_amount = subtotal * (discount_percentage / Decimal('100.00'))
        else:
            if subtotal > 0:
                discount_percentage = (discount_amount / subtotal) * Decimal('100.00')
            else:
                discount_percentage = Decimal('0.00')
                
        taxable_amount = subtotal - discount_amount
        
        cgst_amount = Decimal('0.00')
        sgst_amount = Decimal('0.00')
        igst_amount = Decimal('0.00')
        
        if tax_type == 'GST':
            cgst_amount = taxable_amount * (cgst_rate / Decimal('100.00'))
            sgst_amount = taxable_amount * (sgst_rate / Decimal('100.00'))
            igst_rate = Decimal('0.00')
        elif tax_type == 'IGST':
            igst_amount = taxable_amount * (igst_rate / Decimal('100.00'))
            cgst_rate = Decimal('0.00')
            sgst_rate = Decimal('0.00')
        elif tax_type == 'No GST':
            cgst_rate = Decimal('0.00')
            sgst_rate = Decimal('0.00')
            igst_rate = Decimal('0.00')
            
        total_amount = taxable_amount + cgst_amount + sgst_amount + igst_amount
        balance_due = total_amount - amount_paid
        
        validated_data['subtotal'] = subtotal
        validated_data['discount_percentage'] = discount_percentage
        validated_data['discount_amount'] = discount_amount
        validated_data['cgst_rate'] = cgst_rate
        validated_data['sgst_rate'] = sgst_rate
        validated_data['igst_rate'] = igst_rate
        validated_data['cgst_amount'] = cgst_amount
        validated_data['sgst_amount'] = sgst_amount
        validated_data['igst_amount'] = igst_amount
        validated_data['total_amount'] = total_amount
        validated_data['balance_due'] = balance_due
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Payment Sync Logic for Update
        initial_payment = instance.payments.filter(description="Initial payment recorded on invoice creation").first()
        from django.utils import timezone
        issue_date = validated_data.get('issue_date', instance.issue_date)
        current_time = timezone.now().time()
        payment_datetime = timezone.datetime.combine(issue_date, current_time)
        payment_datetime = timezone.make_aware(payment_datetime, timezone.get_current_timezone())

        if initial_payment:
            other_payments_sum = sum(p.amount for p in instance.payments.exclude(id=initial_payment.id))
            target_initial_amount = amount_paid - other_payments_sum
            if target_initial_amount <= 0:
                initial_payment.delete()
            else:
                initial_payment.amount = target_initial_amount
                initial_payment.payment_date = payment_datetime
                initial_payment.save()
        else:
            all_payments_sum = sum(p.amount for p in instance.payments.all())
            target_initial_amount = amount_paid - all_payments_sum
            if target_initial_amount > 0:
                Payment.objects.create(
                    invoice=instance,
                    amount=target_initial_amount,
                    transaction_id='',
                    description="Initial payment recorded on invoice creation",
                    payment_date=payment_datetime
                )

        if items_data is not None:
            instance.items.all().delete()
            for item_data in calculated_items:
                InvoiceItem.objects.create(invoice=instance, **item_data)
                
        return instance

    def to_representation(self, instance):
        response = super().to_representation(instance)
        from django.utils import timezone
        current_date = timezone.now().date()
        status = response.get('status')
        total_amount = Decimal(str(response.get('total_amount', '0.00')))
        amount_paid = Decimal(str(response.get('amount_paid', '0.00')))
        
        if total_amount > 0 and amount_paid >= total_amount:
            status = 'Paid'
        elif instance.due_date and current_date > instance.due_date:
            status = 'Overdue'
        elif amount_paid > 0 and amount_paid < total_amount:
            status = 'Partially Paid'
            
        response['status'] = status
        
        if instance.customer:
            response['customer'] = {
                'id': instance.customer.id,
                'company_name': instance.customer.company_name,
                'rep_name': instance.customer.rep_name,
                'email': instance.customer.email,
                'phone': instance.customer.phone,
                'address': instance.customer.address,
                'gtin': instance.customer.gtin,
                'website': instance.customer.website
            }
        return response
    
    

#--------------- User Group Serializer-------------#


class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.all(),
        required=False
    )
    users = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(
        required=False
    )
    is_staff = serializers.BooleanField(
        required=False
    )

    class Meta:
        model = Group

        fields = [
            'id',
            'name',
            'permissions',
            'users',
            'is_superuser',
            'is_staff'
        ]

    def get_users(self, obj):
        return [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
            for user in obj.user_set.all()
        ]

    def to_representation(self, instance):
        response = super().to_representation(instance)
        try:
            response['is_superuser'] = instance.profile.is_superuser
            response['is_staff'] = instance.profile.is_staff
        except AttributeError:
            response['is_superuser'] = False
            response['is_staff'] = False
        return response

    def create(self, validated_data):
        permissions = validated_data.pop(
            'permissions',
            []
        )
        is_superuser = validated_data.pop(
            'is_superuser',
            False
        )
        is_staff = validated_data.pop(
            'is_staff',
            False
        )
        group = Group.objects.create(**validated_data)
        group.permissions.set(permissions)
        GroupProfile.objects.create(
            group=group,
            is_superuser=is_superuser,
            is_staff=is_staff
        )
        return group

    def update(self, instance, validated_data):
        permissions = validated_data.pop(
            'permissions',
            []
        )
        is_superuser = validated_data.pop(
            'is_superuser',
            instance.profile.is_superuser if hasattr(instance, 'profile') else False
        )
        is_staff = validated_data.pop(
            'is_staff',
            instance.profile.is_staff if hasattr(instance, 'profile') else False
        )
        instance.name = validated_data.get(
            'name',
            instance.name
        )
        instance.save()

        instance.permissions.set(permissions)
        profile, created = GroupProfile.objects.get_or_create(
            group=instance
        )
        profile.is_superuser = is_superuser
        profile.is_staff = is_staff

        profile.save()

        return instance
    
    
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
        fields = [

            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role', 
            'profile',
            'is_superuser',
            'is_staff',

            ]

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


#------------------User Admin Serializer------------------#

class UserAdminSerializer(serializers.ModelSerializer):
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    role = serializers.SerializerMethodField()
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_staff',
            'is_superuser',
            'role',
            'role_id',
            'profile',
        ]

    def get_role(self, obj):
        group = obj.groups.first()
        return group.name if group else "User"

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            return attrs

        current_user = request.user

        if self.instance and self.instance.is_superuser and not current_user.is_superuser:
            raise serializers.ValidationError("Only superusers can edit superuser accounts.")

        resulting_is_superuser = attrs.get('is_superuser')
        role_id = attrs.get('role_id')

        if role_id is not None:
            group_has_superuser = False
            if role_id > 0:
                try:
                    group = Group.objects.get(id=role_id)
                    group_has_superuser = group.profile.is_superuser
                except (Group.DoesNotExist, AttributeError):
                    pass
            resulting_is_superuser = group_has_superuser
        elif resulting_is_superuser is None and self.instance:
            resulting_is_superuser = self.instance.is_superuser

        if resulting_is_superuser is not None:
            old_is_superuser = self.instance.is_superuser if self.instance else False
            if resulting_is_superuser != old_is_superuser and not current_user.is_superuser:
                raise serializers.ValidationError("Only superusers can grant or revoke superuser status.")

            if old_is_superuser and not resulting_is_superuser:
                superusers = User.objects.filter(is_superuser=True)
                if superusers.count() <= 1 and superusers.filter(id=self.instance.id).exists():
                    raise serializers.ValidationError("Cannot revoke superuser status from the last remaining superuser.")

        return attrs

    def update(self, instance, validated_data):
        role_id = validated_data.pop('role_id', None)
        if role_id is not None:
            instance.groups.clear()
            if role_id > 0:
                try:
                    group = Group.objects.get(id=role_id)
                    instance.groups.add(group)
                except Group.DoesNotExist:
                    pass

            groups = instance.groups.all()
            has_superuser_group = groups.filter(profile__is_superuser=True).exists()
            has_staff_group = groups.filter(profile__is_staff=True).exists()
            validated_data['is_superuser'] = has_superuser_group
            validated_data['is_staff'] = has_staff_group

        password = self.context.get('request').data.get('password')
        if password:
            instance.set_password(password)

        return super().update(instance, validated_data)

