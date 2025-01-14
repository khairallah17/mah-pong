from django.contrib import admin
from api.models import User, Profil, FriendRequest, FriendList

class Admin_Users(admin.ModelAdmin):
    list_display = ('id', 'fullname', 'username', 'email', "password", 'is_online')


class Admin_Profil(admin.ModelAdmin):
    list_display = ('user', 'is_verified')


class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'status', 'created_at')
    search_fields = ('sender__username', 'receiver__username')

class FriendListAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_friend_count')
    search_fields = ('user__username', 'friends__username')

    def get_friend_count(self, obj):
        return obj.friends.count()
    get_friend_count.short_description = 'Number of Friends'
    
admin.site.register(User, Admin_Users)
admin.site.register(Profil, Admin_Profil)
admin.site.register(FriendRequest, FriendRequestAdmin)
admin.site.register(FriendList, FriendListAdmin)