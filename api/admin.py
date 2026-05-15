
from django.contrib import admin
from .models import Menu_Module, Menu_Child, Customer, Service, Invoice, InvoiceItem
from django.utils.html import format_html

#---------------------------------#




#----------Models For Module and Child----------#   

@admin.register(Menu_Module)
class Menu_ModuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'url', 'order')
    ordering = ('order',)

@admin.register(Menu_Child)
class Menu_ChildAdmin(admin.ModelAdmin):
    list_display = ('name', 'module', 'url', 'order')
    list_filter = ('module',)
    ordering = ('module__order', 'order')



#----------Models For Customer Details----------#


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'logo_preview', 'company_name', 'rep_name', 'email')
    search_fields = ('company_name', 'rep_name', 'email')
    list_display_links = ('id', 'company_name')
    readonly_fields = ('logo_preview',)
    def logo_preview(self, obj):
        if obj.logo: 
            return format_html(
                '<img src="{}" width="40" height="40" style="border-radius: 8px; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />',
                obj.logo.url
            )
        return "-" 
    logo_preview.short_description = 'Logo'


#-----------Models for Services-------------#

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'price','description', 'created_at')
    list_editable = ('name', 'price', 'description')  
    search_fields = ('name', 'description')
    ordering = ('created_at',)


#---------------Invoice-------------------#

class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1 

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'issue_date', 'status')
    readonly_fields = ('total_amount', 'balance_due', 'created_at', 'updated_at')   
    list_filter = ('status', 'issue_date')
    search_fields = ('invoice_number', 'customer__company_name')
    inlines = [InvoiceItemInline]