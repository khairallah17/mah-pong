from django.contrib import admin
from api.models import User


class Admin_Users(admin.ModelAdmin):
    list_display = ('id', 'fullname', 'username', 'email', 'password', 'nblose', 'nbwin', 'score', 'img', 'avatar')


class Admin_Profil(admin.ModelAdmin):
    list_display = ('id', 'fullname', 'username', 'email', 'password', 'nblose', 'nbwin', 'score', 'img', 'avatar')

admin.site.register(User, Admin_Users)
admin.site.register(User, Admin_Users)