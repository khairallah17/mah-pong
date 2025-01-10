from django.contrib import admin
from api.models import User, Profil, FriendRequest, FriendList

class Admin_Users(admin.ModelAdmin):
    list_display = ('id', 'fullname', 'username', 'email', 'nblose', 'nbwin', 'score')
    search_fields = ('username', 'email', 'fullname')
    list_filter = ('is_active', 'is_staff', 'two_factor_enabled')

class Admin_Profil(admin.ModelAdmin):
    list_display = ('user', 'is_verified')
    search_fields = ('user__username', 'user__email')
    list_filter = ('is_verified',)

class FriendRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('sender__username', 'receiver__username')
    date_hierarchy = 'created_at'

class FriendListAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_friend_count')
    search_fields = ('user__username', 'friends__username')
    filter_horizontal = ('friends',)

    def get_friend_count(self, obj):
        return obj.friends.count()
    get_friend_count.short_description = 'Number of Friends'
    
admin.site.register(User, Admin_Users)
admin.site.register(Profil, Admin_Profil)
admin.site.register(FriendRequest, FriendRequestAdmin)
admin.site.register(FriendList, FriendListAdmin)