from django.contrib import admin
from api.models import Profile, User
# Register your models here.


class Admin_Users(admin.ModelAdmin):
    details_user_display = ['username', 'email']

class Admin_Profils(admin.ModelAdmin):
    list_display = ['full_name', 'user']

admin.site.register(User, Admin_Users)
admin.site.register(Profile, Admin_Profils)
