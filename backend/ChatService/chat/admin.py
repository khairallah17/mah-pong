from django.contrib import admin
from .models import Message, CustomUser , Conversation

# Register CustomUser with a dedicated admin configuration
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    fields = [ "fullname", "username", "email"]
    list_display = ["id", "username"]

# Register Message model
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    # fields = ["sender", "receiver", "content", "seen", "timestamp"]
    list_display = ["id","sender", "receiver", "content", "seen", "timestamp"]
    # list_editable = ["sender", "receiver", "content", "seen", "timestamp"]

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id","name","user1","user2"]

