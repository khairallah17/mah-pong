import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
import jwt
from django.conf import settings
from channels.db import database_sync_to_async
from Match.models import Match, Tournament, TournamentMatch
from django.db import transaction
from urllib.parse import parse_qs
from django.core.cache import cache
from django.db.models import Q

logger = logging.getLogger(__name__)
matchmaking_pool = []
user_channels = {}
matched_users = {}
game_states = {}
TABLE_LIMIT = 1.5
PADDLE_WIDTH = 1

class TournamentConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tournament_group_name = None
        self.username = None
        self.tournament = None
        self.current_match = None

    async def connect(self):
        query_params = self._parse_query_params()
        token = query_params.get('token', [None])[0]
        tournament_code = query_params.get('code', [None])[0]

        await self.accept()
        try:
            self.username = self._decode_token(token)[:10]
            is_reconnected = cache.get(f"user_reconnect_{self.username}", False)
            if not is_reconnected:
                self.tournament = await self._initialize_tournament(tournament_code)
                await self.add_player_to_tournament(self.tournament.id, self.username)
                if (self.tournament.status == 'active'):
                    await self.send(text_data=json.dumps({"type": "players_ready", "players": self.tournament.players}))
                    logger.warning(f"sending: {self.tournament.players}")
                await self.get_or_create_tournament_matches(self.tournament, self.username)
                logger.warning(f"tournament: {self.tournament} not reconnected")
                cache.set(f"user_reconnect_{self.username}", True)
            else:
                self.tournament = await self.is_user_in_tournament(self.username)
                logger.warning(f"tournament: {self.tournament} reconnected")
                # cache.set(f"user_reconnect_{self.username}", True, timeout=6)

            if self.tournament:
                self.tournament_group_name = f"tournament_{self.tournament.id}"
                await self.channel_layer.group_add(self.tournament_group_name, self.channel_name)
                await self.send_tournament_state(self.tournament)
            else:
                logger.error("Failed to initialize tournament")

        except jwt.ExpiredSignatureError:
            await self.send_error_message('token_expired', 4001)
        except jwt.InvalidTokenError as e:
            await self.send_error_message('invalid_token', 4002, str(e))

    async def disconnect(self, close_code):
        # cache.set(f"user_reconnect_{self.username}", False, timeout=None)
        logger.warning(f"disconnecting: {self.username}")
        if self.tournament_group_name:
            await self.channel_layer.group_discard(self.tournament_group_name, self.channel_name)
        
        # if self.username:
        #     cache.set(f"user_reconnect_{self.username}", True, timeout=3)
        #     await self.schedule_remove_player()
        # if self.tournament:
        #     await self.send_tournament_state(self.tournament)

# 1- take away player removal when user disconnects /done
# 2- add player removal when user clicks quit button /done
# 3- make sure no changes happen when user reconnects /done
# 4- implement notifications when players ready

    async def schedule_remove_player(self):
        start_time = asyncio.get_event_loop().time()
        while asyncio.get_event_loop().time() - start_time < 5:
            is_reconnected = cache.get(f"user_reconnect_{self.username}", False)
            logger.warning(f"abt to remove player: {self.username}, is_reconnected: {is_reconnected} and tournament: {self.tournament} and players: {self.tournament.players}")
            if not is_reconnected:
                await self.remove_player_from_tournament(self.username)
                if self.current_match:
                    await self.remove_player_from_match(self.current_match, self.username)
                if self.tournament and (not self.tournament.players or self.tournament.players == []):
                    logger.warning(f"tournament removed players {self.tournament.players}")
                    await self.delete_tournament(self.tournament)
                break
            await asyncio.sleep(1)
        
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'match_result':
                await self.handle_match_result(data)
            elif message_type == 'player_ready':
                await self.handle_player_ready(data)
            elif message_type == 'quit_tournament':
                cache.set(f"user_reconnect_{self.username}", False)
                await self.schedule_remove_player()
        except Exception as e:
            logger.error(f"Error in receive: {e}")

    # Tournament Management

    @database_sync_to_async
    def delete_tournament(self, tournament):
        try:
            tournament.delete()
        except Exception as e:
            logger.error(f"Error deleting tournament: {e}")

    @database_sync_to_async
    def remove_player_from_match(self, match_id, username):
        try:
            match = TournamentMatch.objects.get(id=match_id)
            trunc_username = username[:10]
            logger.warning(f"match.player1 {match.player1}")
            logger.warning(f"match.player2 {match.player2}")
            logger.warning(f"username {trunc_username}")
            if match.player1 == trunc_username:
                logger.warning(f"player deleted from match {match.player1}")
                match.player1 = None
            elif match.player2 == trunc_username:
                logger.warning(f"player deleted from match {match.player2}")
                match.player2 = None
            match.save()
        except Exception as e:
            logger.error(f"Error removing player from match: {e}")

    @database_sync_to_async
    def get_or_create_tournament(self, code):
        if not code or code == 'null':
            return Tournament.objects.create()
        tournament = Tournament.objects.get(code=code)
        if not tournament or tournament.status != 'waiting':
            raise Exception("Tournament not found or not in waiting state.")
        return tournament

    async def _initialize_tournament(self, code):
        tournament = await self.get_or_create_tournament(code)
        await self.send(text_data=json.dumps({'type': 'tournament_code', 'code': tournament.code}))
        return tournament

    @database_sync_to_async
    def is_user_in_tournament(self, username):
        try:
            trunc_username = username[:10]
            tournament = Tournament.objects.filter(players__contains=[username], status='waiting').first()
            if tournament:
                match = TournamentMatch.objects.filter(Q(tournament=tournament) & (Q(player1=trunc_username) | Q(player2=trunc_username))).first()
                self.current_match = match.id
                return tournament
        except Exception as e:
            logger.error(f"Error checking if user is in tournament: {e}")
            return None

    @database_sync_to_async
    def add_player_to_tournament(self, tournament_id, username):
        try:
            with transaction.atomic():
                tournament = Tournament.objects.select_for_update().get(id=tournament_id)
                if username not in tournament.players:
                    tournament.players.append(username)
                    if (len(tournament.players) == 4):
                        tournament.status = 'active'
                    self.tournament = tournament
                    tournament.save()

        except Exception as e:
            logger.error(f"Error adding player to tournament: {e}")

    @database_sync_to_async
    def remove_player_from_tournament(self, username):
        try:
            with transaction.atomic():
                tournament = Tournament.objects.select_for_update().filter(players__contains=[username], status='waiting').first()
                if tournament:
                    tournament.players = [player for player in tournament.players if player != username]
                    self.tournament = tournament
                    tournament.save()
        except Exception as e:
            logger.error(f"Error removing player: {e}")
        

    # Match Handling

    @database_sync_to_async
    def get_or_create_tournament_matches(self, tournament, username):
        matches = list(TournamentMatch.objects.filter(tournament=tournament))
        logger.warning(f"matches: {matches}")

        if matches and not any(username in [match.player1, match.player2] for match in matches):
            for match in matches:
                if not match.player1:
                    match.player1 = username
                    self.current_match = match.id
                    match.save()
                    return matches
                elif not match.player2:
                    match.player2 = username
                    self.current_match = match.id
                    match.save()
                    return matches
        if not matches:
            matches = self._create_tournament_matches(tournament, username)

        return matches

    def _create_tournament_matches(self, tournament, username):
        matches = []
        for round in range(1, 3):
            for position in range(1, (2 ** (2 - round)) + 1):
                match, _ = TournamentMatch.objects.get_or_create(tournament=tournament, round=round, position=position)
                matches.append(match)

        matches[0].player1 = username
        self.current_match = matches[0].id
        matches[0].save()
        return matches

    @database_sync_to_async
    def handle_player_ready_sync(self, data):
        try:
            match = TournamentMatch.objects.get(id=self.current_match)
            trunc_username = self.username[:10]

            if match.player1 == trunc_username:
                match.player1_ready = True
            elif match.player2 == trunc_username:
                match.player2_ready = True

            match.save()
            return match.player1_ready and match.player2_ready
        except Exception as e:
            logger.error(f"Error handling player ready: {e}")
            return False

    async def handle_player_ready(self, data):
        both_ready = await self.handle_player_ready_sync(data)
        logger.warning(f"both_ready: {both_ready}")
        if both_ready:
            await self.match_start()

    @database_sync_to_async
    def handle_match_result(self, data):
        try:
            match_id = data.get('match_id')
            winner = data.get('winner')
            match = TournamentMatch.objects.get(id=match_id)

            match.winner = winner
            match.save()

            next_round = match.round + 1
            next_position = match.position // 2

            next_match, _ = TournamentMatch.objects.get_or_create(tournament=match.tournament, round=next_round, position=next_position)

            if match.position % 2 == 0:
                next_match.player1 = winner
            else:
                next_match.player2 = winner
            next_match.save()
        except Exception as e:
            logger.error(f"Error handling match result: {e}")

    # Tournament State Management

    async def send_tournament_state(self, tournament):
        state = await self.get_tournament_state(tournament)
        await self.channel_layer.group_send(self.tournament_group_name, {"type": "tournament_update", "matches": state['matches']})

    @database_sync_to_async
    def get_tournament_state(self, tournament):
        try:
            matches = TournamentMatch.objects.filter(tournament=tournament)
            return {
                "matches": [
                    {
                        "id": match.id,
                        "round": match.round,
                        "position": match.position,
                        "player1": match.player1,
                        "player2": match.player2,
                        "winner": match.winner
                    } for match in matches
                ]
            }
        except Exception as e:
            logger.error(f"Error fetching tournament state: {e}")
            return {"matches": []}

    async def tournament_update(self, event):
        await self.send(text_data=json.dumps({"type": "tournament_update", "matches": event["matches"]}))

    # Utility Functions

    async def send_error_message(self, error_type, code, message=None):
        logger.warning(f"{error_type}: {message}")
        await self.send(text_data=json.dumps({'type': error_type, 'message': message}))
        await self.close(code=code)

    async def match_start(self):
        logger.warning("Match start")
        await self.send(text_data=json.dumps({"type": "match_start"}))

    def _parse_query_params(self):
        query_string = self.scope['query_string'].decode()
        return parse_qs(query_string)

    def _decode_token(self, token):
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')
        if not username:
            raise jwt.InvalidTokenError("Username not found in token.")
        return username


disconnected_users = {}

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.username = None
        await self.accept()
        token = self.scope['query_string'].decode().split('=')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            self.username = payload.get('username')
            if not self.username:
                raise jwt.InvalidTokenError("Username not found in token")
            
            if self.username in disconnected_users:
                user_data = disconnected_users.pop(self.username)
                #self.channel_name = user_data['channel_name']
                user_data['task'].cancel()
                
                await self.send(text_data=json.dumps({
                    'type': 'match_found',
                    'player_id': user_data['player_id'],
                    'score': user_data['score']
                }))
            user_channels[self.username] = self.channel_name
            
            if self.username not in matchmaking_pool and self.username not in matched_users:
                matchmaking_pool.append(self.username)
                # await self.channel_layer.group_add("matchmaking_pool", self.channel_name)
            
            if len(matchmaking_pool) >= 2:
                await self.match_users()
        except jwt.ExpiredSignatureError:
            await self.send_error_message('token_expired', 4001)
        except jwt.InvalidTokenError as e:
            await self.send_error_message('invalid_token', 4002, str(e))

    async def disconnect(self, close_code):
        if self.username:
            user_channels.pop(self.username, None)
            if self.username in matchmaking_pool:
                matchmaking_pool.remove(self.username)
            await self.channel_layer.group_discard("matchmaking_pool", self.channel_name)
            
            if self.username in matched_users:
                # Store the user's state and start a countdown for reconnection
                # opponent = matched_users[self.username]
                scoreP1, scoreP2, isPlayer1 = await self.get_latest_match_scores()
                countdown_task = asyncio.create_task(self.start_reconnect_countdown(self.username))
                disconnected_users[self.username] = {
                    'task': countdown_task,
                    'channel_name': self.channel_name,
                    'player_id': '1' if isPlayer1 else '2',
                    'score': {'player1': scoreP1, 'player2': scoreP2} if isPlayer1 else {'player1': scoreP2, 'player2': scoreP1}
                }

    # handle new connection
    # handle 2 disconnections at the same time if (opponent in disconnected_users)
    # if 2 users disconnect the countdown should be stopped
    async def start_reconnect_countdown(self, username):
        start_time = asyncio.get_event_loop().time()
        opponent = matched_users[username]
        while opponent not in disconnected_users and asyncio.get_event_loop().time() - start_time < 15:
            await asyncio.sleep(1)
        if username in disconnected_users:
            scoreP1, scoreP2, isPlayer1 = await self.get_latest_match_scores()
            disconnected_users.pop(username)
            if opponent not in disconnected_users:
                await self.channel_layer.send(
                    user_channels[opponent],
                    {
                        'type': 'game_event',
                        'event': 'opponent_disconnected',
                        'message': 'You won because your opponent disconnected.'
                    }
                )
            await self.update_game_result(username, opponent, scoreP1, scoreP2, winner=opponent)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        if not message_type:
            logger.warning("No message type found in data: %s", data)
            return

        if message_type == 'game_event':
            await self.handle_game_event(data)

    async def handle_game_event(self, data):
        event = data.get('event')
        player_id = data.get('player_id')
        if event == 'game_over':
            await self.handle_game_over(data)
        elif event == 'score_update':
            await self.handle_score_update(data.get('scoreP1'), data.get('scoreP2'))
        elif self.username in matched_users:
            opponent = matched_users[self.username]
            await self.channel_layer.send(
                user_channels[opponent],
                {
                    'type': 'game_event',
                    'event': event,
                    'player_id': player_id,
                    'position': data.get('position'),
                    'scoreP1': data.get('scoreP1'),
                    'scoreP2': data.get('scoreP2')
                }
            )

    @database_sync_to_async
    def get_latest_match_scores(self):
        opponent = matched_users[self.username]
        logger.warning(f"username1: {self.username}, username2: {opponent}")
        match = Match.objects.filter(
            Q(username1=self.username, username2=opponent) | Q(username1=opponent, username2=self.username)).latest('datetime')
        if match.username1 == self.username:
            return match.scoreP1, match.scoreP2, True
        else:
            return match.scoreP2, match.scoreP1, False

    @database_sync_to_async
    def handle_score_update(self, scoreP1, scoreP2):
        opponent = matched_users[self.username]
        match = Match.objects.filter(
            Q(username1=self.username, username2=opponent) | Q(username1=opponent, username2=self.username)).latest('datetime')
        match.scoreP1 = scoreP1
        match.scoreP2 = scoreP2
        match.save()

    async def handle_game_over(self, data):
        winner = data.get('winner')
        player1, player2 = self.username, matched_users[self.username]
        scoreP1, scoreP2 = data.get('scoreP1'), data.get('scoreP2')
        await self.update_game_result(player1, player2, scoreP1, scoreP2, winner)

    async def match_users(self):
        users = matchmaking_pool[:2]
        matchmaking_pool.remove(users[0])
        matchmaking_pool.remove(users[1])
        matched_users[users[0]] = users[1]
        matched_users[users[1]] = users[0]

        await self.create_game(users[0], users[1])

        await self.channel_layer.send(
            user_channels[users[0]],
            {
                'type': 'match_found',
                'player_id': '1'
            }
        )
        await self.channel_layer.send(
            user_channels[users[1]],
            {
                'type': 'match_found',
                'player_id': '2'
            }
        )

    @database_sync_to_async
    def create_game(self, username1, username2):
        Match.objects.create(
            username1=username1,
            username2=username2,
            scoreP1=0,
            scoreP2=0,
            winner=None
        )

    @database_sync_to_async
    def update_game_result(self, username1, username2, scoreP1, scoreP2, winner):
        match = Match.objects.filter(Q(username1=username1, username2=username2) | Q(username1=username2, username2=username1)).latest('datetime')
        match.scoreP1 = scoreP1
        match.scoreP2 = scoreP2
        match.winner = username1 if winner == 'player1' else username2
        match.save()
        matched_users.pop(username1)
        matched_users.pop(username2)

    async def send_error_message(self, error_type, code, message=None):
        logger.warning(f"{error_type}: {message}")
        await self.send(text_data=json.dumps({
            'type': error_type,
            'message': message
        })) 
        await self.close(code=code)

    async def match_found(self, event):
        player_id = event['player_id']
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'player_id': player_id
        }))

    async def game_event(self, event):
        game_event = event['event']
        player_id = event.get('player_id', None)
        scoreP1 = event.get('scoreP1')
        scoreP2 = event.get('scoreP2')
        logger.warning(f"Game event: {game_event}, scoreP1: {scoreP1}, scoreP2: {scoreP2}")
        await self.send(text_data=json.dumps({
            'type': 'game_event',
            'event': game_event,
            'player_id': player_id,
            'position': event.get('position'),
            'scoreP1': scoreP1,
            'scoreP2': scoreP2
        }))

# Complex logic for matchmaking

# class MatchmakingConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.username = None
#         self.is_matched = False
#         logger.info("connected")
#         await self.accept()
#         self.update_ball_position_task = asyncio.create_task(self.update_ball_position_periodically())


#     async def disconnect(self, close_code):
#         self.update_ball_position_task.cancel()
#         if self.is_matched:
#             self.send_game_state_task.cancel()
#         if self.username:
#             if self.username in user_channels:
#                 del user_channels[self.username]
#             if self.username in matchmaking_pool:
#                 matchmaking_pool.remove(self.username)
#             if self.username in matched_users:
#                 opponent = matched_users.pop(self.username)
#                 del matched_users[opponent]
#             if self.username in game_states:
#                 del game_states[self.username]
#         await self.channel_layer.group_discard("matchmaking_pool", self.channel_name)

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message_type = data.get('type')
#         logger.warning(data)
#         if message_type == 'set_username':
#             self.username = data.get('username')
#             logger.warning(f"Username set to: {self.username}")
#             if self.username:
#                 user_channels[self.username] = self.channel_name
#                 matchmaking_pool.append(self.username)
#                 await self.channel_layer.group_add("matchmaking_pool", self.channel_name)

#                 if len(matchmaking_pool) >= 2:
#                     user1 = matchmaking_pool.pop(0)
#                     user2 = matchmaking_pool.pop(0)
#                     matched_users[user1] = user2
#                     matched_users[user2] = user1

#                     game_states[user1] = self.init_game_state()
#                     game_states[user2] = game_states[user1]

#                     await self.channel_layer.send(user_channels[user1], {
#                         'type': 'match_found',
#                         'player_id': '1'
#                     })
#                     await self.channel_layer.send(user_channels[user2], {
#                         'type': 'match_found',
#                         'player_id': '2'
#                     })
#                     if self.is_matched == False:
#                         self.send_game_state_task = asyncio.create_task(self.send_game_state_periodically())
#                     self.is_matched = True

#         elif message_type == 'game_event':
#             event = data.get('event')
#             player_id = data.get('player_id')
#             if self.username in matched_users:
#                 opponent = matched_users[self.username]
#                 await self.process_game_event(self.username, event, player_id)

#     async def process_game_event(self, username, event, player_id):
#         game_state = game_states[username]
#         newPosition = 0
#         if player_id == 1:
#             if event == 'player_move_up':
#                 newPosition = game_state['paddle1_z'] - 0.05
#             elif event == 'player_move_down':
#                 newPosition = game_state['paddle1_z'] + 0.05
#             if abs(newPosition) + paddleWidth / 2 < tableLimit:
#                 game_state['paddle1_z'] = newPosition
#         elif player_id == 2:
#             if event == 'player_move_up':
#                 newPosition = game_state['paddle2_z'] - 0.05
#             elif event == 'player_move_down':
#                 newPosition = game_state['paddle2_z'] + 0.05
#             if abs(newPosition) + paddleWidth / 2 < tableLimit:
#                 game_state['paddle2_z'] = newPosition
#         game_state['is_paused'] = False

#     def update_ball_position(self, game_state):
#         game_state['ball_x'] += game_state['ball_direction_x'] * 0.015
#         game_state['ball_z'] += game_state['ball_direction_z'] * 0.015

#         # Handle collisions with paddles and walls
#         self.handle_collisions(game_state)

#     def handle_collisions(self, game_state):
#         # Reverse the ball direction if it hits the walls
#         if game_state['ball_z'] < -1.5 or game_state['ball_z'] > 1.5:
#             game_state['ball_direction_z'] *= -1

#         # Reverse the ball direction if it hits the paddles
#         if (game_state['ball_x'] < -2.5 and abs(game_state['ball_z'] - game_state['paddle1_z']) < 0.5) or \
#            (game_state['ball_x'] > 2.5 and abs(game_state['ball_z'] - game_state['paddle2_z']) < 0.5):
#             game_state['ball_direction_x'] *= -1

#         # Reset the ball if it goes past the paddles (goal scored)
#         if game_state['ball_x'] < -2.56 or game_state['ball_x'] > 2.56:
#             game_state['ball_x'] = 0
#             game_state['ball_z'] = 0
#             game_state['ball_direction_x'] *= -1
#             game_state['score1' if game_state['ball_x'] > 0 else 'score2'] += 1
#             game_state['is_paused'] = True


#     async def send_game_state(self, username):
#         game_state = game_states[username]
#         await self.channel_layer.send(user_channels[username], {
#             'type': 'game_state',
#             'game_state': game_state
#         })

#     async def send_game_state_periodically(self):
#         while self.is_matched:
#             await asyncio.sleep(0.015)  # Adjust the interval
#             if self.username in game_states:
#                 self.update_ball_position(game_states[self.username])
#                 await self.send_game_state(self.username)
#                 opponent = matched_users.get(self.username)
#                 if opponent:
#                     await self.send_game_state(opponent)

#     async def update_ball_position_periodically(self):
#         while True:

#             if self.username in game_states:
#                 self.update_ball_position(game_states[self.username])
#             await asyncio.sleep(0.015)  # Adjust the interval

#     def init_game_state(self):
#         return {
#             'is_paused': True,
#             'paddle1_z': 0,
#             'paddle2_z': 0,
#             'ball_x': 0,
#             'ball_z': 0,
#             'ball_direction_x': 1,
#             'ball_direction_z': 1,
#             'score1': 0,
#             'score2': 0,
#         }

#     async def match_found(self, event):
#         player_id = event['player_id']
#         await self.send(text_data=json.dumps({
#             'type': 'match_found',
#             'player_id': player_id
#         }))

#     async def game_event(self, event):
#         game_event = event['event']
#         await self.send(text_data=json.dumps({
#             'type': 'game_event',
#             'event': game_event
#         }))

#     async def game_state(self, event):
#         game_state = event['game_state']
#         await self.send(text_data=json.dumps({
#             'type': 'game_state',
#             'game_state': game_state
#         }))