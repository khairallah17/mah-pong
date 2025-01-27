from rest_framework import serializers # type: ignore
from .models import Message, Conversation, CustomUser as User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'fullname', 'email']

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username', default=None)
    receiver = serializers.CharField(source='receiver.username', default=None)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'seen', 'message_type']

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'user1', 'user2', 'messages']