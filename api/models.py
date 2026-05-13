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

#------------------------------------------#