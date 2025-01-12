import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Conversation, CustomUser as User
from urllib.parse import parse_qs
from django.db.models import Q 
import jwt
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = self._parse_query_params()
        self.user_id = query_params.get('user_id', [None])[0]
        logger.warning(f"user_id: {self.user_id}")
        token = query_params.get('token', [None])[0]
        logger.warning(f"token: {token}")
        self.username = self._decode_token(token)
        logger.warning(f"WebSocket connected for user: {self.username}")
        self.room_group_name = f"chat_{self.user_id}"

        # Join the chat group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the chat group
        print(f"WebSocket disconnected with code: {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender = User.objects.get(username=self.username)
        receiver_id = data['receiver_id']
        content = data['message']

        # Ensure conversation exists between sender and receiver
        conversation = await self.get_or_create_conversation(sender, receiver_id)

        # Save the message to the database
        message = await database_sync_to_async(Message.objects.create)(
            sender=sender,
            receiver_id=receiver_id,
            content=content,
            conversation=conversation
        )

        # Broadcast the message to the chat group
        await self.channel_layer.group_send(
            f"chat_{receiver_id}",
            {
                'type': 'chat.message',
                'message': content,
                'username': sender.username
            }
        )

    @database_sync_to_async
    def get_or_create_conversation(self, sender, receiver_id):
        # Get or create the conversation between the two users
        receiver = User.objects.get(id=receiver_id)
        conversation = Conversation.objects.filter(
            (Q(user1=sender) & Q(user2=receiver)) |
            (Q(user1=receiver) & Q(user2=sender))
        ).first()

        if not conversation:
            conversation = Conversation.objects.create(
                name=f"Chat with {receiver.username}",
                user1=sender,
                user2=receiver
            )
        return conversation

    async def chat_message(self, event):
        message = event["message"]
        username = event["username"]

        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username
        }))
        
    # utils
    def _parse_query_params(self):
        query_string = self.scope['query_string'].decode()
        return parse_qs(query_string)

    def _decode_token(self, token):
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')
        if not username:
            raise jwt.InvalidTokenError("Username not found in token.")
        return username

    # async def connect(self):
    #     self.user_id = self.scope['url_route']['kwargs']['user_id']
    #     print(self.scope)
    #     print("WebSocket connected for user:", self.user_id)
    #     await self.accept()

    # async def disconnect(self, close_code):
    #     print(f"WebSocket disconnected with code: {close_code}")

    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     message = data['message']
    #     await self.send(text_data=json.dumps({
    #         'message': message
    #     }))

    