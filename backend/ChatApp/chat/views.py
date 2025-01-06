from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Message, User
from .serializers import MessageSerializer, UserSerializer
from rest_framework import authentication, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated



class ApiUsers(APIView):
    permissions = [IsAuthenticated]

    def get(self, request):
        print(request)
        print("heeere i am ")
        users = User.objects.exclude(id=request.user.id) #Exclude current user
        serializer = UserSerializer(users, many=True)
        print("here ==>  ", serializer.data)
        return Response(serializer.data)

# @api_view(['GET'])
# def get_users(request):
#     print(request)
#     print("heeere i am ")
#     users = User.objects.exclude(id=request.user.id) #Exclude current user
#     serializer = UserSerializer(users, many=True)
#     return Response(serializer.data)

@api_view(['GET'])
def user_list(self, request):
    users = User.objects.all().values("id", "username")
    return JsonResponse(list(users), safe=False)

@api_view(['GET'])
def get_conversation(request, user_id):
    user = User.objects.get(id=user_id)
    messages = Message.objects.filter(
        sender__in=[user]
    ).order_by('timestamp')

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def test(request):
    test = "fasdf"
    return Response(test)

@api_view(['POST'])
def send_message(request):
    sender_id = request.data.get('sender_id')
    receiver_id = request.data.get('receiver_id')
    content = request.data.get('message')

    try:
        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({"error": "User not foound"}, status=404)

    message = Message.objects.create(
        sender=sender,
        receiver=receiver,
        content=content
    )
    return Response({
        "id": message.id,
        "sender": message.sender.username,
        "receiver": message.receiver.username,
        "content": message.content,
        "timestamp": message.timestamp
    })
# class ConversationView(ApiView):
#     pass 