import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)
matchmaking_pool = []
user_channels = {}
matched_users = {}
game_states = {}

class MatchmakingConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.update_ball_position_event = asyncio.Event()

    async def connect(self):
        self.username = None
        self.is_matched = False
        logger.info("connected")
        await self.accept()
        self.update_ball_position_task = asyncio.create_task(self.update_ball_position_periodically())
        self.update_ball_position_event.clear()

    async def disconnect(self, close_code):
        self.update_ball_position_task.cancel()
        self.send_game_state_task.cancel()
        if self.username:
            if self.username in user_channels:
                del user_channels[self.username]
            if self.username in matchmaking_pool:
                matchmaking_pool.remove(self.username)
            if self.username in matched_users:
                opponent = matched_users.pop(self.username)
                del matched_users[opponent]
            if self.username in game_states:
                del game_states[self.username]
        await self.channel_layer.group_discard("matchmaking_pool", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        logger.warning(data)
        if message_type == 'set_username':
            self.username = data.get('username')
            logger.warning(f"Username set to: {self.username}")
            if self.username:
                user_channels[self.username] = self.channel_name
                matchmaking_pool.append(self.username)
                await self.channel_layer.group_add("matchmaking_pool", self.channel_name)

                if len(matchmaking_pool) >= 2:
                    user1 = matchmaking_pool.pop(0)
                    user2 = matchmaking_pool.pop(0)
                    matched_users[user1] = user2
                    matched_users[user2] = user1

                    game_states[user1] = self.init_game_state()
                    game_states[user2] = game_states[user1]

                    await self.channel_layer.send(user_channels[user1], {
                        'type': 'match_found',
                        'player_id': '1'
                    })
                    await self.channel_layer.send(user_channels[user2], {
                        'type': 'match_found',
                        'player_id': '2'
                    })

                    self.is_matched = True
                    self.send_game_state_task = asyncio.create_task(self.send_game_state_periodically())

        elif message_type == 'game_event':
            event = data.get('event')
            player_id = data.get('player_id')
            if self.username in matched_users:
                opponent = matched_users[self.username]
                await self.process_game_event(self.username, event, player_id)

    async def process_game_event(self, username, event, player_id):
        game_state = game_states[username]

        if player_id == '1':
            if event == 'player_move_up':
                game_state['paddle1_z'] -= 0.05
            elif event == 'player_move_down':
                game_state['paddle1_z'] += 0.05
        elif player_id == '2':
            if event == 'player_move_up':
                game_state['paddle2_z'] -= 0.05
            elif event == 'player_move_down':
                game_state['paddle2_z'] += 0.05
        self.update_ball_position_event.set()
        game_state['is_paused'] = False

    def update_ball_position(self, game_state):
        game_state['ball_x'] += game_state['ball_direction_x'] * 0.05
        game_state['ball_z'] += game_state['ball_direction_z'] * 0.05

        # Handle collisions with paddles and walls
        self.handle_collisions(game_state)

    def handle_collisions(self, game_state):
        # Reverse the ball direction if it hits the walls
        if game_state['ball_z'] < -1.5 or game_state['ball_z'] > 1.5:
            game_state['ball_direction_z'] *= -1

        # Reverse the ball direction if it hits the paddles
        if (game_state['ball_x'] < -2.5 and abs(game_state['ball_z'] - game_state['paddle1_z']) < 0.5) or \
           (game_state['ball_x'] > 2.5 and abs(game_state['ball_z'] - game_state['paddle2_z']) < 0.5):
            game_state['ball_direction_x'] *= -1

        # Reset the ball if it goes past the paddles (goal scored)
        if game_state['ball_x'] < -3 or game_state['ball_x'] > 3:
            game_state['ball_x'] = 0
            game_state['ball_z'] = 0
            game_state['ball_direction_x'] *= -1
            game_state['score1' if game_state['ball_x'] > 0 else 'score2'] += 1
            game_state['is_paused'] = True
            self.update_ball_position_event.clear()

    async def send_game_state(self, username):
        game_state = game_states[username]
        await self.channel_layer.send(user_channels[username], {
            'type': 'game_state',
            'game_state': game_state
        })

    async def send_game_state_periodically(self):
        while self.is_matched:
            await asyncio.sleep(0.05)  # Adjust the interval
            if self.username in game_states:
                self.update_ball_position(game_states[self.username])
                logger.warning(f"Sending game state to Self: {self.username}")
                await self.send_game_state(self.username)
                opponent = matched_users.get(self.username)
                if opponent:
                    logger.warning(f"Sending game state to Opponent: {opponent}")
                    await self.send_game_state(opponent)

    async def update_ball_position_periodically(self):
        while True:
            await self.update_ball_position_event.wait()
            if self.username in game_states:
                self.update_ball_position(game_states[self.username])
            await asyncio.sleep(0.05)  # Adjust the interval

    def init_game_state(self):
        return {
            'is_paused': True,
            'paddle1_z': 0,
            'paddle2_z': 0,
            'ball_x': 0,
            'ball_z': 0,
            'ball_direction_x': 1,
            'ball_direction_z': 1,
            'score1': 0,
            'score2': 0,
        }

    async def match_found(self, event):
        player_id = event['player_id']
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'player_id': player_id
        }))

    async def game_event(self, event):
        game_event = event['event']
        await self.send(text_data=json.dumps({
            'type': 'game_event',
            'event': game_event
        }))

    async def game_state(self, event):
        game_state = event['game_state']
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'game_state': game_state
        }))