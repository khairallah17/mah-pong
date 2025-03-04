import requests
from django.conf import settings
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from .models import Message, Conversation, BlockList
from .models import Message, CustomUser as User
from .serializers import MessageSerializer, UserSerializer, ConversationSerializer
from rest_framework import authentication, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from django.db.models import Q
from django.contrib.auth.models import AnonymousUser
from django.shortcuts import get_object_or_404 
from uuid import UUID
from rest_framework import status
from django.core.exceptions import ValidationError
from django.http import JsonResponse
import logging
import jwt

logger = logging.getLogger(__name__)

class test(APIView):
    def get(self, request):
        return Response({"message":"working"})

class ApiUsers(APIView):

    def get(self, request):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return Response({"error": "Authorization header missing"}, status=400)

            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            username = payload.get('username')
            email = payload.get('email')
            fullname = payload.get('fullname')

            if not username:
                raise jwt.InvalidTokenError("invalid token.")
            response = requests.get(
                f"{settings.USERMANAGEMENT_SERVICE_URL}/api/friends/",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            users_data = response.json()

            # Store users in the Chat service's database
            for user_data in users_data:
                for friend in user_data['friends']:
                    logger.warning(f"USERS {friend}")
                    User.objects.update_or_create(
                        id=friend['id'],
                        defaults={
                            'username': friend['username'],
                            'fullname': friend.get('fullname', ''),
                            'email': friend['email'],
                            'img': friend.get('img', 'profile_pics/default.jpg')
                        }
                    )
            # Update or create the current user
            current_user = User.objects.get_or_create(
                id=user_id,
                defaults={
                    'username': username,
                    'email': email,
                    'fullname': fullname
                }
            )

            return Response(user_data.get('friends', []))
        except jwt.InvalidTokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except requests.ConnectionError as e:
            logger.error(f"ConnectionError: {e}")
            return Response({"error": "Failed to connect to UserManagement service"}, status=400)
        except requests.RequestException as e:
            logger.error(f"RequestException: {e}")
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Exception: {e}")
            return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def get_conversation(request, id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({"error": "Authorization header missing"}, status=400)
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')
        if not username:
            raise jwt.InvalidTokenError("Username not found in token.")
        user = User.objects.get(username=username)
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
        return Response({'error': str(e)}, status=401)

@api_view(['POST'])
def block_user(request, user_id):
    try:
        # Authenticate user
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({"error": "Authorization header missing"}, status=400)
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')  
        if not username:
            raise jwt.InvalidTokenError("Username not found in token.")
        
        # Get the requesting user
        requesting_user = User.objects.get(username=username)
        
        # Protect fetching the target user
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Target user not found"}, status=404)
        except ValidationError:
            return Response({"error": "Invalid user ID format"}, status=400)
        
        # Get or create blocklist for the requesting user
        blocklist, created = BlockList.objects.get_or_create(user=requesting_user)
        
        action = request.data.get('action')
        if action == 'block':
            # Block the target user
            blocklist.block_user(target_user)
            return Response({"message": f"You have blocked {target_user.username}."})
        elif action == 'unblock':
            # Unblock the target user
            blocklist.unblock_user(target_user)
            return Response({"message": f"You have unblocked {target_user.username}."})
        else:
            return Response({"error": "Invalid action"}, status=400)
    
    except jwt.ExpiredSignatureError:
        return Response({"error": "Token has expired"}, status=401)
    except jwt.InvalidTokenError as e:
        return Response({"error": str(e)}, status=401)


@api_view(['GET'])
def get_block_status(request, user_id):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({"error": "Authorization header missing"}, status=400)
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')
        if not username:
            raise jwt.InvalidTokenError("Username not found in token.")
        user1 = User.objects.get(username=username)
        try:
            user2 = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except ValidationError:
            return Response({"error": "Invalid UUID format for user_id"}, status=400)

        is_user1_blocking = BlockList.objects.filter(user=user1, blocked_users=user2).exists()

        return Response({
            "block_status": is_user1_blocking
        })

    except ValidationError:
        return Response({"error": "Invalid UUID format for user2_id"}, status=400)

