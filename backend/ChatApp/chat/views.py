from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from .models import Message, Conversation
from .models import Message, CustomUser as User
from .serializers import MessageSerializer, UserSerializer, ConversationSerializer
from rest_framework import authentication, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from django.db.models import Q
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import get_object_or_404 

# logger = logging.getLogger(__name__)



class ApiUsers(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
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

# @api_view(['GET'])
# def get_conversation(request, user_id):
#     user = User.objects.get(id=user_id)
#     messages = Message.objects.filter(
#         sender__in=[user]
#     ).order_by('timestamp')

#     serializer = MessageSerializer(messages, many=True)
#     print (serializer.data)
#     return Response(serializer.data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation(request, id):
    try:
        # Get the conversation by ID
        conversation = get_object_or_404(Conversation, id=id)

        # Check if the user is part of the conversation
        if request.user != conversation.user1 and request.user != conversation.user2:
            return Response({'error': 'You do not have permission to view this conversation.'}, status=403)

        # Serialize the conversation along with messages
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=500)
    # try:
    #     # Ensure the user is authenticated
    #     if not request.user.is_authenticated:
    #         return Response({"error": "Authentication required"}, status=401)

    #     user1 = request.user
    #     user2 = User.objects.get(id=id)

    #     conversation = Conversation.objects.filter(
    #         (Q(user1=user1) & Q(user2=user2)) |
    #         (Q(user1=user2) & Q(user2=user1))
    #     ).first()

    #     if not conversation:
    #         conversation = Conversation.objects.create(
    #             name="New Conversation",
    #             user1=user1,
    #             user2=user2
    #         )

    #     # Permission check
    #     if request.user != conversation.user1 and request.user != conversation.user2:
    #         return Response({'error': 'You do not have permission to view this conversation.'}, status=403)

    #     messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
    #     serializer = MessageSerializer(messages, many=True)

    #     return Response(serializer.data)

    # except User.DoesNotExist:
    #     return Response({"error": "User not found"}, status=404)
    # except Exception as e:
    #     return Response({"error": str(e)}, status=500)


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