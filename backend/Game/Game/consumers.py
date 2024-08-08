from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from channels.db import database_sync_to_async

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        await self.send(text_data)

logger = logging.getLogger(__name__)
matchmaking_pool = []

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = None
        await self.accept()

    async def disconnect(self, close_code):
        if self.username and self.username in matchmaking_pool:
            matchmaking_pool.remove(self.username)
        await self.channel_layer.group_discard("matchmaking_pool", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        logger.warning(data)
        if message_type == 'set_username':
            self.username = data.get('username')
            if self.username:
                await self.save_username_to_session(self.username)
                logger.info(f"Username set to {self.username}")
                
                # Add the user to the matchmaking pool
                matchmaking_pool.append(self.username)
                await self.channel_layer.group_add("matchmaking_pool", self.channel_name)
                
                # Check if there are two users in the pool
                if len(matchmaking_pool) >= 2:
                    logger.warning("MATCH FOUND")
                    users = matchmaking_pool[:2]
                    matchmaking_pool.remove(users[0])
                    matchmaking_pool.remove(users[1])
                    await self.channel_layer.group_send(
                        "matchmaking_pool",
                        {
                            'type': 'match_found',
                            'opponent': users[1]
                        }
                    )
                    await self.channel_layer.group_send(
                        "matchmaking_pool",
                        {
                            'type': 'match_found',
                            'opponent': users[0]
                        }
                    )
            else:
                logger.warning("NO USERNAME FOUND")
        else:
            message = data.get('message')
            await self.send(text_data=json.dumps({
                'message': message,
                'username': self.username
            }))
    @database_sync_to_async
    def save_username_to_session(self, username):
        self.scope['session']['username'] = username
        self.scope['session'].save()

    async def match_found(self, event):
        opponent = event['opponent']
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'opponent': opponent
        }))