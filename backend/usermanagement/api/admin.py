from django.contrib import admin
from api.models import Profil, User


class Admin_Users(admin.ModelAdmin):
    list_display = ('id', 'fullname', 'username', 'email', 'password', 'nblose', 'nbwin', 'score', 'img', 'avatar')


class Admin_Profil(admin.ModelAdmin):
    list_display_profil = ['id', 'fullname', 'user']

admin.site.register(User, Admin_Users)
admin.site.register(Profil, Admin_Profil)