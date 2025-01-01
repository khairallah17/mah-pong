from django.contrib import admin
from .models import Chat , Message
# Register your models here.

@admin.register(Message)
class Message(admin.ModelAdmin):
    fields = ["sender","receiver"]
    list_display = ["sender","receiver"]

@admin.register(Chat)
class Chat(admin.ModelAdmin):
    list_display = ["name","created_at"]
