import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import BlockList, Message, Conversation, CustomUser as User
from urllib.parse import parse_qs
from django.db.models import Q 
import jwt
from django.conf import settings
import logging
from django.utils.timezone import now
# from .serializers import MessageSerializer

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_params = self._parse_query_params()
        # self.user_id = query_params.get('user_id', [None])[0]
        token = query_params.get('token', [None])[0]
        self.username = self._decode_token(token)
        self.user = await self.get_user(username=self.username)
        self.room_group_name = f"chat_{self.user.id}"

        # Join the chat group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave the chat group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        sender = await self.get_user(username=self.username)
        receiver_id = data['user_id']
        receiver = await self.get_user(user_id=receiver_id)
        content = data.get('message', '')
        message_type = data.get("message_type", '')

        block_status = await self.get_blocklists(sender, receiver)

        if block_status["status"] == "blocked":
            if block_status["blocker"] == sender.username:
                await self.send(text_data=json.dumps({
                    'type': 'blocked',
                    'content': f'You cannot send messages to {receiver.username} as you have blocked them.'
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'blocked',
                    'content': f'You cannot send messages to {receiver.username} as they have blocked you.'
                }))
            return

        if block_status["status"] == "mutual_block":
            await self.send(text_data=json.dumps({
                'type': 'blocked',
                'content': f'You and {receiver.username} have mutually blocked each other.'
            }))
            return

        conversation = await self.get_or_create_conversation(sender, receiver_id)

        # Save the message to the database
        message = await self.create_message(sender, receiver_id, content, conversation, message_type)
        
        # Broadcast the message to the chat group
        await self.channel_layer.group_send(
            f"chat_{receiver_id}",
            {
                'type': 'chat_message',
                'content': content,
                'sender': sender.username,
                'receiver': receiver.username,
                'timestamp': str(now()),
                'message_type': message_type
            }
        )
        await self.channel_layer.group_send(
            f"chat_{sender.id}",
            {
                'type': 'chat_message',
                'content': content,
                'sender': sender.username,
                'receiver': receiver.username,
                'timestamp': str(now()),
                'message_type': message_type
            }
        )

    @database_sync_to_async
    def get_blocklists(self, user1, user2):
        try:
            blocklist1 = BlockList.objects.get(user=user1)
        except BlockList.DoesNotExist:
            blocklist1 = None
        try:
            blocklist2 = BlockList.objects.get(user=user2)
        except BlockList.DoesNotExist:
            blocklist2 = None
        
        if blocklist1 and blocklist1.is_user_blocked(user2):
            if blocklist2 and blocklist2.is_user_blocked(user1):
                return {"status": "mutual_block", "blocker": None}
            return {"status": "blocked", "blocker": user1.username}

        if blocklist2 and blocklist2.is_user_blocked(user1):
            return {"status": "blocked", "blocker": user2.username}

        return {"status": "not_blocked", "blocker": None}


    @database_sync_to_async
    def get_user(self, username=None, user_id=None):
        if username:
            return User.objects.get(username=username)
        elif user_id:
            return User.objects.get(id=user_id)

    @database_sync_to_async
    def get_or_create_conversation(self, sender, receiver_id):
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

    @database_sync_to_async
    def create_message(self, sender, receiver_id, content, conversation):
        return  Message.objects.create(
            sender=sender,
            receiver_id=receiver_id,
            content=content,
            conversation=conversation,
        )

    async def chat_message(self, event):
        content = event["content"]
        sender = event["sender"]
        receiver = event["receiver"]
        timestamp = event["timestamp"]
        message_type = event["message_type"]

        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'content': content,
            'sender': sender,
            'receiver': receiver,
            'timestamp': timestamp,
            'message_type': message_type
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

    @database_sync_to_async
    def get_user_id(self):
        return User.objects.get(username=self.username).id
