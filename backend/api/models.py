from django.db import models
import os
from django.db.models.signals import post_delete
from django.utils import timezone
from django.dispatch import receiver 
from django.contrib.auth.models import User, Group, Permission
from django.core.exceptions import ValidationError


#-------------------------------------# 


#--------------side bar Modules------------------#

class Menu_Module(models.Model):
    name = models.CharField(max_length=100)
    icon = models.TextField(blank=True, null=True, help_text="Paste raw SVG code here from heroicons.com")
    url = models.CharField(max_length=50, blank=True, null=True, help_text="Leave blank if this module has children")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class Menu_Child(models.Model):
    module = models.ForeignKey(Menu_Module, related_name='children', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    url = models.CharField(max_length=50)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.module.name} > {self.name}"

#---------------Customer Details-------------------#

class Customer(models.Model):
    company_name = models.CharField(max_length=200)
    rep_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True) 
    gtin = models.CharField(max_length=100, blank=True, null=True)
    website = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name


@receiver(post_delete, sender=Customer)
def delete_customer_logo(sender, instance, **kwargs):

    if instance.logo:
        if os.path.isfile(instance.logo.path):
            os.remove(instance.logo.path)


#---------------service Details-------------------#


class Service(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ₹{self.price}"


#---------------Invoice-------------------#


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Sent', 'Sent'),
        ('Partially Paid', 'Partially Paid'),
        ('Paid', 'Paid'),
        ('Overdue', 'Overdue'),
    ]

    # Relational Data
    
    customer = models.ForeignKey('Customer', on_delete=models.SET_NULL, null=True, related_name='invoices')
    
    # Meta Data
    invoice_number = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    # Text Fields

    notes = models.TextField(blank=True, null=True)
    terms = models.TextField(blank=True, null=True)
    
    # Financials 
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Discounts & Taxes

    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    cgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=9.00)
    sgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=9.00)
    cgst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    sgst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    #  Tax Fields 
    tax_type = models.CharField(
        max_length=20,
        choices=[('GST', 'GST'), ('No GST', 'No GST'), ('IGST', 'IGST')],
        default='GST'
    )
    igst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    igst_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Totals

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        from decimal import Decimal
        total = Decimal(str(self.total_amount))
        paid = Decimal(str(self.amount_paid))
        if paid > total:
            raise ValidationError({
                'amount_paid': f"Amount paid ({paid}) cannot exceed the total amount ({total})."
            })

    def save(self, *args, **kwargs):
        from decimal import Decimal
        self.balance_due = Decimal(str(self.total_amount)) - Decimal(str(self.amount_paid))
        
        
        if self.total_amount > 0 and self.amount_paid >= self.total_amount:
            self.status = 'Paid'
        elif self.due_date and timezone.now().date() > self.due_date:
            self.status = 'Overdue'
        elif self.amount_paid > 0 and self.amount_paid < self.total_amount:
            self.status = 'Partially Paid'
        else:
            if self.status in ['Paid', 'Partially Paid']:
                self.status = 'Sent'

        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.company_name if self.customer else 'Unknown'}"


class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    service = models.ForeignKey('Service', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.CharField(max_length=255)
    
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.description}"


#---------------Payments-------------------#


class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateTimeField(default=timezone.now)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate amount_paid of the invoice
        self.invoice.amount_paid = sum(p.amount for p in self.invoice.payments.all())
        self.invoice.save()

    def delete(self, *args, **kwargs):
        invoice = self.invoice
        super().delete(*args, **kwargs)
        invoice.amount_paid = sum(p.amount for p in invoice.payments.all())
        invoice.save()

    def __str__(self):
        return f"Payment of {self.amount} for {self.invoice.invoice_number} (TXN: {self.transaction_id})"


#---------------User Profile-------------------#

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)

    def __str__(self):
        return self.user.username

@receiver(models.signals.post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(models.signals.post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    instance.profile.save()

@receiver(post_delete, sender=UserProfile)
def delete_user_profile_picture(sender, instance, **kwargs):
    if instance.profile_picture:
        if os.path.isfile(instance.profile_picture.path):
            os.remove(instance.profile_picture.path)


#-------------Group and Permissions--------------#

class GroupProfile(models.Model):

    group = models.OneToOneField(
        Group,
        on_delete=models.CASCADE,
        related_name='profile'
    )

    is_superuser = models.BooleanField(
        default=False
    )

    is_staff = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.group.name


#------------------------------------------------#