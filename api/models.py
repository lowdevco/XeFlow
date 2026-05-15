from django.db import models
import os
from django.db.models.signals import post_delete
from django.dispatch import receiver 
from django.utils import timezone  


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
    logo = models.ImageField(upload_to='logos/', blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name


@receiver(post_delete, sender=Customer)
def delete_customer_logo(sender, instance, **kwargs):
    # Check if the customer actually had a logo
    if instance.logo:
        # Check if the file physically exists on the hard drive
        if os.path.isfile(instance.logo.path):
            # Delete it!
            os.remove(instance.logo.path)

#---------------service Details-------------------#


class Service(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ${self.price}"


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
    
    # Totals

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    balance_due = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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


#------------------------------------------------#