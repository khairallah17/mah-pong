import json 
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    # async def connect(self):
    #     self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
    #     print("WebSocket connection attempt for user:", self.scope['url_route']['kwargs']['user_id'])
    #     self.room_group_name = f"chat_{self.user_id}"

    #     #Join the chat group
    #     await self.channel_layer.group_add(
    #         self.room_group_name,
    #         self.channel_name
    #     )
    #     await self.accept()

    # async def disconnect(self, close_code):
    #     #Leave the chat group
    #     print(f"WebSocket disconnected with code: {close_code}")
    #     await self.channel_layer.group_discard(
    #         self.room_group_name,
    #         self.channel_name
    #     )

    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     message = data['message']
    #     # messages = await database_sync_to_async(Message.objects.create)(
    #     #     sender = self.scope['user'],
    #     #     receive_id = data['receiver_id'],
    #     #     content = data['message']
    #     # )

    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        print(self.scope)
        print("WebSocket connected for user:", self.user_id)
        await self.accept()

    async def disconnect(self, close_code):
        print(f"WebSocket disconnected with code: {close_code}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))

        #Broadcast the message to the group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'message': message
            }
            # f"chat_{data['receiver_id']}",
            # {
            #     "type": "chat_message",
            #     "message": message.content,
            #     "username": message.sender.username,
            # }
        )

    async def chat_message(self, event):
        message = event["message"]
        username = event["username"]

        #Send the message to WebSocket
        await self.send(text_data=json.dumps({
            # "message": message,
            # "username": username,
            'message': event['message']
        }))