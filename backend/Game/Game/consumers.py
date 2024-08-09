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
user_channels = {}

class MatchmakingConsumer(AsyncWebsocketConsumer):
    users = []
    async def connect(self):
        self.username = None
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the user's channel name from the dictionary
        if self.username and self.username in user_channels:
            del user_channels[self.username]
        if self.username and self.username in matchmaking_pool:
            matchmaking_pool.remove(self.username)
        await self.channel_layer.group_discard("matchmaking_pool", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        if message_type is None:
            logger.warning("No message type found", data)
        logger.warning(data)
        if message_type == 'set_username':
            self.username = data.get('username')
            if self.username:
                # Add the user's channel name to the dictionary
                user_channels[self.username] = self.channel_name

                await self.save_username_to_session(self.username)
                logger.info(f"Username set to {self.username}")
                
                # Add the user to the matchmaking pool
                matchmaking_pool.append(self.username)
                await self.channel_layer.group_add("matchmaking_pool", self.channel_name)
                
                # Check if there are two users in the pool
                if len(matchmaking_pool) >= 2:
                    logger.warning("MATCH FOUND")
                    self.users = matchmaking_pool[:2]
                    matchmaking_pool.remove(self.users[0])
                    matchmaking_pool.remove(self.users[1])
                    await self.channel_layer.send(
                        user_channels[self.users[0]],
                        {
                            'type': 'match_found',
                            'opponent': self.users[1]
                        }
                    )
                    await self.channel_layer.send(
                        user_channels[self.users[1]],
                        {
                            'type': 'match_found',
                            'opponent': self.users[0]
                        }
                    )
            else:
                logger.warning("NO USERNAME FOUND")
        else:
            event = data.get('event')
            if (self.username == self.users[0]):
                await self.channel_layer.send(
                    user_channels[self.users[1]],
                    {
                        'type': 'game_event',
                        'event': event,
                    }
                )
            else:
                await self.channel_layer.send(
                    user_channels[self.users[0]],
                    {
                        'type': 'game_event',
                        'event': event,
                    }
                )
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