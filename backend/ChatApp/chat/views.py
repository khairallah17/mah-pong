from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import response
from .models import Message
from .serializers import MessageSerializer, UserSerializer

@api_view(['GET'])
def get_users(request):
    users = User.objects.exclude(id=request.user.id) #Exclude current user
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_conversation(request, user_id):
    user = User.objects.get(id=user_id)
    messages = Message.objects.filter(
        sender__in=[request.user, user],
        receiver__in=[request.user, user]
    ).order_by('timestamp')

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)
