import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Conversation, CustomUser


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
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
        sender = self.scope['user']
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
        receiver = CustomUser.objects.get(id=receiver_id)
        conversation = Conversation.objects.filter(
            (models.Q(user1=sender) & models.Q(user2=receiver)) |
            (models.Q(user1=receiver) & models.Q(user2=sender))
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
