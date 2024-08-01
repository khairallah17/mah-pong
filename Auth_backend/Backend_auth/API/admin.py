from django.contrib import admin
from API.models import User
# Register your models here.


class Admin_User(admin.ModelAdmin):
    details_user_display = ['username', 'email']

admin.register(User, Admin_User)
