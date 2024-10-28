from django.contrib import admin
from api.models import Profile, User
# Register your models here.


class Admin_Users(admin.ModelAdmin):
    # details_user_display =  ('id', 'username', 'email', 'fullname')
    details_user_display = ('id', 'fullname', 'username', 'email')
    

class Admin_Profils(admin.ModelAdmin):
    list_display = ('id', 'get_fullname', 'get_username', 'get_email', 'get_password', 'nblose', 'nbwin', 'score')

    def get_fullname(self, obj):
        return obj.user.fullname
    
    def get_username(self, obj):
        return obj.user.username
    
    def get_email(self, obj):
        return obj.user.email
    
    def get_password(self, obj):
        return obj.user.password

        
admin.site.register(User, Admin_Users)
admin.site.register(Profile, Admin_Profils)
