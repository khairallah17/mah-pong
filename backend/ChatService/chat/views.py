import requests
from django.conf import settings
from django.shortcuts import render # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.decorators import api_view, permission_classes, authentication_classes # type: ignore
from rest_framework.response import Response # type: ignore
from .models import Message, Conversation
from .models import Message, CustomUser as User
from .serializers import MessageSerializer, UserSerializer, ConversationSerializer
from rest_framework import authentication, permissions # type: ignore
from rest_framework.permissions import AllowAny, IsAuthenticated # type: ignore
from rest_framework.authentication import SessionAuthentication, TokenAuthentication # type: ignore
from django.db.models import Q # type: ignore
from django.contrib.auth.models import AnonymousUser # type: ignore
from django.shortcuts import get_object_or_404  # type: ignore
import logging
import jwt

logger = logging.getLogger(__name__)



class ApiUsers(APIView):

    def get(self, request):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return Response({"error": "Authorization header missing"}, status=400)

            token = auth_header.split(' ')[1]

            # logger.warning(f"Token: {token}")
            # logger.warning(f"UserManagement Service URL: {settings.USERMANAGEMENT_SERVICE_URL}")

            response = requests.get(
                f"{settings.USERMANAGEMENT_SERVICE_URL}/api/friends/",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            users_data = response.json()
            # logger.warning(f"Users: {users_data}")

            # Store users in the Chat service's database
            for user_data in users_data:
                for friend in user_data['friends']:
                    User.objects.update_or_create(
                        id=friend['id'],
                        defaults={
                            'username': friend['username'],
                            'fullname': friend.get('fullname', ''),\
                            'email': friend['email'],
                            'img': friend.get('img', 'profile_pics/default.jpg')
                        }
                    )

            # Serialize and return the users
            # serializer = UserSerializer(User.objects.all(), many=True)
            #User.objects.create_or_update(curent_userdata)
            return Response(user_data.get('friends', []))
        except requests.ConnectionError as e:
            logger.error(f"ConnectionError: {e}")
            return Response({"error": "Failed to connect to UserManagement service"}, status=500)
        except requests.RequestException as e:
            logger.error(f"RequestException: {e}")
            return Response({"error": str(e)}, status=500)
        except Exception as e:
            logger.error(f"Exception: {e}")
            return Response({"error": str(e)}, status=500)


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
    return JsonResponse(list(users), safe=False) # type: ignore

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
# @permission_classes([IsAuthenticated])
def get_conversation(request, id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({"error": "Authorization header missing"}, status=400)
        token = auth_header.split(' ')[1]
        # logger.warning(f"Token: {token}")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        # logger.warning(f"Payload: {payload}")
        username = payload.get('username')
        # logger.warning(f"Username: {username}")
        if not username:
            raise jwt.InvalidTokenError("Username not found in token.")
        user = User.objects.get(username=username)
        # logger.warning(f"Request user: {user} user2 id: {id} username: {username} token: {token}")
        conversation = Conversation.objects.filter(
            (Q(user1=user) & Q(user2_id=id)) |
            (Q(user2=user) & Q(user1_id=id))
        ).first()

        if not conversation:
            conversation = Conversation.objects.create(
                name="New Conversation",
                user1=user,
                user2=User.objects.get(id=id)
            )

        # Serialize the conversation along with messages
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
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
        return Response({"error": "User not found"}, status=404)

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