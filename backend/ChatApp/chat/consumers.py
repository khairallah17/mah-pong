import json 
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        #Join the chat group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        #Leave the chat group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        messages = await database_sync_to_async(Message.objects.create)(
            sender = self.scope['user'],
            receive_id = data['receiver_id'],
            content = data['message']
        )

        #Broadcast the message to the group
        await self.channel_layer.group_send(
            f"chat_{data['receiver_id']}",
            {
                "type": "chat_message",
                "message": message.content,
                "username": message.sender.username,
            }
        )

    async def chat_message(self, event):
        message = event["message"]
        username = event["username"]

        #Send the message to WebSocket
        await self.send(text_data=json.dumps({
            "message": message,
            "username": username,
        }))