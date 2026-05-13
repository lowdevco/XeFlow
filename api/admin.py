
from django.contrib import admin
from .models import Menu_Module, Menu_Child


#---------------------------------#


@admin.register(Menu_Module)
class Menu_ModuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'url', 'order')
    ordering = ('order',)

@admin.register(Menu_Child)
class Menu_ChildAdmin(admin.ModelAdmin):
    list_display = ('name', 'module', 'url', 'order')
    list_filter = ('module',)
    ordering = ('module__order', 'order')