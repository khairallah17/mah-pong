from django.contrib import admin
from api.models import Profil, User, FriendRequest


class Admin_Users(admin.ModelAdmin):
    list_display = ('id', 'fullname', 'username', 'email', 'password', 'nblose', 'nbwin', 'score', 'img', 'avatar')


class Admin_Profil(admin.ModelAdmin):
    list_display_profil = ['id', 'fullname', 'user']


class FriendListAdmin(admin.ModelAdmin):
    list_display = ['friends']

class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ['sender', 'receiver', 'status', 'timestamp']

admin.site.register(User, Admin_Users)
# admin.site.register(User)
admin.site.register(Profil, Admin_Profil)
# admin.site.register(User, FriendListAdmin)
admin.site.register(FriendRequest, FriendRequestAdmin)