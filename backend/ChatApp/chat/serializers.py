from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Message

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class MessageSerializer(serializers.ModelSerializer):
    sender = serializer.CharField(source='sender.username')
    receiver = serializers.CharField(source='receiver.username')

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'seen']