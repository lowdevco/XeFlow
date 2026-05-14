from django.db import models

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


#------------------------------------------------#