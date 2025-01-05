from django.contrib import admin
from .models import  Message, User
# Register your models here.

@admin.register(User)
class User(admin.ModelAdmin):
    fields = ["fullname","username", "email"]
    list_display = ["fullname","username", "email"]


@admin.register(Message)
class Message(admin.ModelAdmin):
    fields = ["sender","receiver", "content"]
    list_display = ["sender","receiver", "content"]
