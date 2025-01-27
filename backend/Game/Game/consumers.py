import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer # type: ignore
import json
import logging
import jwt
from django.conf import settings # type: ignore
from channels.db import database_sync_to_async # type: ignore
from Match.models import Match, Tournament, TournamentMatch
from django.db import transaction # type: ignore
from urllib.parse import parse_qs
from django.core.cache import cache # type: ignore
from django.db.models import Q, F # type: ignore

logger = logging.getLogger(__name__)

matchmaking_pool = []
pools = {}
user_channels = {}
matched_users = {}
game_states = {}
present_players = {}
disconnected_users = {}
TABLE_LIMIT = 1.5
PADDLE_WIDTH = 1
BALL_SPEED = 0.1

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
            self.username = self._decode_token(token)
            is_reconnected = cache.get(f"user_reconnect_{self.username}", False)
            if not is_reconnected:
                await self.initialize_new_connection(tournament_code)
            else:
                await self.handle_reconnection(tournament_code)

            if self.tournament:
                self.mark_player_present(self.tournament.id, self.username)
                self.tournament_group_name = f"tournament_{self.tournament.id}"
                logger.warning(f"adding to group: {self.tournament_group_name}")
                await self.channel_layer.group_add(self.tournament_group_name, self.channel_name)
                await self.send_tournament_state(self.tournament)
                if await self.is_eliminated():
                    self.mark_player_absent(self.tournament.id, self.username)
                await self.handle_player_ready()
            else:
                logger.error("Failed to initialize tournament")

        except jwt.ExpiredSignatureError:
            await self.send_error_message('token_expired', 4001)
        except jwt.InvalidTokenError as e:
            await self.send_error_message('invalid_token', 4002, str(e))

    async def initialize_new_connection(self, tournament_code):
        self.tournament = await self._initialize_tournament(tournament_code)
        await self.add_player_to_tournament(self.tournament.id, self.username)
        await self.get_or_create_tournament_matches(self.tournament, self.username)
        logger.warning(f"tournament: {self.tournament} not reconnected")
        cache.set(f"user_reconnect_{self.username}", True)

    async def handle_reconnection(self, tournament_code):
        self.tournament = await self.is_user_in_tournament(self.username)
        logger.warning(f"tournament code: {tournament_code} ")
        logger.warning(f"self.tournament code: {self.tournament.code} ")
        if tournament_code and tournament_code != 'null' and tournament_code != self.tournament.code:
            await self.send(text_data=json.dumps({'type': 'already_in_tournament'}))
            return
        logger.warning(f"tournament: {self.tournament} reconnected")

    async def disconnect(self, close_code):
        self.mark_player_absent(self.tournament.id, self.username)
        logger.warning(f"disconnecting: {self.username}")
        if self.tournament_group_name:
            await self.channel_layer.group_discard(self.tournament_group_name, self.channel_name)

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

            if message_type == 'quit_tournament':
                cache.set(f"user_reconnect_{self.username}", False)
                await self.schedule_remove_player()
            elif message_type == 'start_final_match':
                await self.start_final_match()
            elif message_type == 'tournament_complete':
                cache.set(f"user_reconnect_{self.username}", False)
                Tournament.objects.filter(id=self.tournament.id).update(status='completed')
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
            logger.warning(f"match.player1 {match.player1}")
            logger.warning(f"match.player2 {match.player2}")
            logger.warning(f"username {username}")
            if not match.winner:
                if match.player1 == username:
                    logger.warning(f"player deleted from match {match.player1}")
                    match.player1 = None
                elif match.player2 == username:
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
        if not tournament or tournament.status == 'completed':
            raise Exception("Tournament not found or completed.")
        return tournament

    async def _initialize_tournament(self, code):
        tournament = await self.get_or_create_tournament(code)
        await self.send(text_data=json.dumps({'type': 'tournament_code', 'code': tournament.code}))
        return tournament

    @database_sync_to_async
    def is_user_in_tournament(self, username):
        try:
            tournament = Tournament.objects.filter(Q(players__contains=[username]) & (Q(status='waiting') | Q(status='active'))).latest('created_at')
            if tournament:
                match = TournamentMatch.objects.filter(Q(tournament=tournament) & (Q(player1=username) | Q(player2=username))).latest('created_at')
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
                    self.tournament = tournament
                    tournament.save()
        except Exception as e:
            logger.error(f"Error adding player to tournament: {e}")

    @database_sync_to_async
    def remove_player_from_tournament(self, username):
        try:
            with transaction.atomic():
                tournament = Tournament.objects.filter(Q(players__contains=[username]) & (Q(status='waiting') | Q(status='active'))).latest('created_at')
                if tournament:
                    tournament.players = [player for player in tournament.players if player != username]
                    self.tournament = tournament
                    tournament.save()
        except Exception as e:
            logger.error(f"Error removing player: {e}")

    # Match Handling

    @database_sync_to_async
    def get_or_create_tournament_matches(self, tournament, username):
        matches = list(TournamentMatch.objects.filter(tournament=tournament).order_by('created_at'))

        if matches and not any(username in [match.player1, match.player2] for match in matches):
            for match in matches:
                if not match.player1:
                    match.player1 = username
                    self.current_match = match.id
                    match.save()
                    logger.warning(f"matches: {matches} adding player1: {username} to match: {match.id}")
                    return matches
                elif not match.player2:
                    match.player2 = username
                    self.current_match = match.id
                    match.save()
                    logger.warning(f"matches: {matches} adding player2: {username} to match: {match.id}")
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
        logger.warning(f"matches: {matches} adding player1: {username} to match: {matches[0].id}")
        matches[0].save()
        return matches

    @database_sync_to_async
    def handle_player_ready_sync(self):
        try:
            logger.warning(f"user: {self.username} current_match: {self.current_match}")
            tournament = Tournament.objects.get(id=self.tournament.id)
            # get match with round 2 and position 1 in this tournament and see if it has 2 players
            tournament_match = TournamentMatch.objects.get(tournament=tournament, round=2, position=1)
            if not tournament_match.player1 or not tournament_match.player2:
                if len(present_players.get(self.tournament.id, [])) == 4:
                    tournament.status = 'active'
                    tournament.save()
                    return True
            else:
                if len(present_players.get(self.tournament.id, [])) == 2:
                    return True
            return False
                
        except Exception as e:
            logger.error(f"Error handling player ready: {e}")
            return False

    async def handle_player_ready(self):
        all_ready = await self.handle_player_ready_sync()
        logger.warning(f"all_ready: {all_ready}")
        if all_ready:
            await self.send(text_data=json.dumps({"type": "players_ready", "players": self.tournament.players}))
            await self.channel_layer.group_send(
                self.tournament_group_name,
                {
                    "type": "match_start",
                }
            )

    async def start_final_match(self):
        try:
            tournament = await self.is_user_in_tournament(self.username)
            if tournament:
                final_match, _ = TournamentMatch.objects.get(tournament=tournament, round=2, position=1)
                if final_match.player1 and final_match.player2:
                    await self.channel_layer.group_send(
                        self.tournament_group_name,
                        {
                            "type": "match_start",
                        }
                    )
        except Exception as e:
            logger.error(f"Error starting final match: {e}")        

    # @database_sync_to_async
    # def handle_match_result(self, data):
    #     try:
    #         match_id = data.get('match_id')
    #         winner = data.get('winner')
    #         match = TournamentMatch.objects.get(id=match_id)

    #         match.winner = winner
    #         match.save()
    #         if match.round == 1:
    #             next_match, _ = TournamentMatch.objects.get(tournament=match.tournament, round=2, position=1)

    #             if match.position % 2 == 0:
    #                 next_match.player1 = winner
    #             else:
    #                 next_match.player2 = winner
    #             next_match.save()
    #     except Exception as e:
    #         logger.error(f"Error handling match result: {e}")

    # Tournament State Management

    async def send_tournament_state(self, tournament):
        state = await self.get_tournament_state(tournament)
        await self.channel_layer.group_send(self.tournament_group_name, {"type": "tournament_update", "matches": state['matches']})

    @database_sync_to_async
    def get_tournament_state(self, tournament):
        try:
            matches = TournamentMatch.objects.filter(tournament=tournament).order_by('created_at')
            return {
                "matches": [
                    {
                        "id": match.id,
                        "round": match.round,
                        "position": match.position,
                        "player1": match.player1,
                        "player2": match.player2,
                        "winner": match.winner,
                    } for match in matches
                ]
            }
        except Exception as e:
            logger.error(f"Error fetching tournament state: {e}")
            return {"matches": []}

    @database_sync_to_async
    def is_eliminated(self):
        try:
            latest_match = TournamentMatch.objects.filter(
                Q(tournament=self.tournament) & (Q(player1=self.username) | Q(player2=self.username))
            ).latest('created_at')
            if not latest_match.winner:
                return False
            return latest_match.winner != self.username
        except TournamentMatch.DoesNotExist:
            return False

    # Utility && message handlers
    async def players_ready(self, event):
        await self.send(text_data=json.dumps({"type": "players_ready", "players": event["players"], "tournamentMatch_id": self.current_match}))

    async def tournament_update(self, event):
        await self.send(text_data=json.dumps({"type": "tournament_update", "matches": event["matches"]}))

    async def send_error_message(self, error_type, code, message=None):
        logger.warning(f"{error_type}: {message}")
        await self.send(text_data=json.dumps({'type': error_type, 'message': message}))
        await self.close(code=code)

    async def match_start(self, event=None):
        logger.warning(f"Match id {self.current_match} start ")
        if await self.is_eliminated():
            return
        await self.send(text_data=json.dumps({"type": "match_start", "tournamentMatch_id": self.current_match}))

    def _parse_query_params(self):
        query_string = self.scope['query_string'].decode()
        return parse_qs(query_string)

    def _decode_token(self, token):
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        username = payload.get('username')
        if not username:
            raise jwt.InvalidTokenError("Username not found in token.")
        return username

    def mark_player_present(self, tournament_id, username):
        if tournament_id not in present_players:
            present_players[tournament_id] = []
        if username not in present_players[tournament_id]:
            present_players[tournament_id].append(username)

    def mark_player_absent(self, tournament_id, username):
        if tournament_id in present_players and username in present_players[tournament_id]:
            present_players[tournament_id].remove(username)




pvp2d_matchmaking_pool = []
pvp2d_pools = {}
pvp2d_user_channels = {}
pvp2d_matched_users = {}
pvp2d_game_states = {}
pvp2d_disconnected_users = {}
pvp2d_send_gamestate_tasks = {}

class Pvp2dConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.username = None
        self.invite_code = None
        self.match_id = None
        self.player_id = None

    async def connect(self):
        await self.accept()
        query_params = parse_qs(self.scope['query_string'].decode())
        token = query_params.get('token', [None])[0]
        self.invite_code = query_params.get('invite', [None])[0]
        self.match_id = query_params.get('match_id', [None])[0]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            self.username = payload.get('username')
            if not self.username:
                raise jwt.InvalidTokenError("Username not found in token")
            
            if self.username in pvp2d_disconnected_users:
                user_data = pvp2d_disconnected_users.pop(self.username)
                user_data['task'].cancel()
                logger.warning(f"Cancelled countdown task for {self.username}")
                await self.send(text_data=json.dumps({
                    'type': 'match_found',
                    'player_id': user_data['player_id'],
                    'names': user_data['names'],
                    'game_state': user_data['game_state']
                }))
            pvp2d_user_channels[self.username] = self
            if self.invite_code:
                if self.invite_code in pvp2d_pools and pvp2d_pools[self.invite_code] != self.username:
                    opponent = pvp2d_pools.pop(self.invite_code)
                    await self.match_users(self.username, opponent)
                else:
                    pvp2d_pools[self.invite_code] = self.username
            elif self.match_id:
                match_players = await self.get_players_from_match_id(self.match_id)
                if match_players and self.username in match_players:
                    if self.match_id in pvp2d_pools and pvp2d_pools[self.match_id] != self.username:
                        opponent = pvp2d_pools.pop(self.match_id)
                        await self.match_users(self.username, opponent)
                    else:
                        pvp2d_pools[self.match_id] = self.username
                else:
                    await self.send_error_message('invalid_match_id', 4003)
            else:
                if self.username not in pvp2d_matchmaking_pool and self.username not in pvp2d_matched_users:
                    pvp2d_matchmaking_pool.append(self.username)
            
            if len(pvp2d_matchmaking_pool) >= 2:
                await self.match_users()
        except jwt.ExpiredSignatureError:
            await self.send_error_message('token_expired', 4001)
        except jwt.InvalidTokenError as e:
            await self.send_error_message('invalid_token', 4002, str(e))

    async def match_users(self, user1=None, user2=None):
        if user1 and user2:
            pvp2d_matched_users[user1] = user2
            pvp2d_matched_users[user2] = user1
        else:
            user1 = pvp2d_matchmaking_pool.pop(0)
            user2 = pvp2d_matchmaking_pool.pop(0)
            pvp2d_matched_users[user1] = user2
            pvp2d_matched_users[user2] = user1

        self.player_id = '1' if user1 == self.username else '2'
        await self.create_game(user1, user2)

        shared_game_state = self.init_gamestate()
        pvp2d_game_states[user1] = shared_game_state
        pvp2d_game_states[user2] = shared_game_state

        if user1 in pvp2d_user_channels:
            await self.channel_layer.send(
                pvp2d_user_channels[user1].channel_name,
                {
                    'type': 'match_found',
                    'player_id': '1',
                    'names': {'player1': user1, 'player2': user2},
                    'game_state': shared_game_state
                }
            )
        if user2 in pvp2d_user_channels:
            await self.channel_layer.send(
                pvp2d_user_channels[user2].channel_name,
                {
                    'type': 'match_found',
                    'player_id': '2',
                    'names': {'player1': user1, 'player2': user2},
                    'game_state': shared_game_state
                }
            )
        if user1 not in pvp2d_send_gamestate_tasks and user2 not in pvp2d_send_gamestate_tasks:
            task = asyncio.create_task(self.send_gamestate_periodically(user1, user2))
            logger.warning(f"Starting gamestate task")
            pvp2d_send_gamestate_tasks[user1] = task
            pvp2d_send_gamestate_tasks[user2] = task

    @database_sync_to_async
    def get_players_from_match_id(self, match_id):
        try:
            match = Match.objects.get(id=match_id)
            return (match.username1, match.username2)
        except Match.DoesNotExist:
            return None

    @database_sync_to_async
    def create_game(self, username1, username2):
        Match.objects.create(
            username1=username1,
            username2=username2,
            scoreP1=0,
            scoreP2=0,
            winner=None
        )

    def update_ball_position(self, game_state):
        if game_state['is_paused']:
            return
        game_state['ball_x'] += game_state['ball_direction_x'] * game_state['ball_speed']
        game_state['ball_z'] += game_state['ball_direction_z'] * game_state['ball_speed']

        self.handle_collisions(game_state)

    def handle_collisions(self, game_state):
        # walls collision
        if game_state['ball_z'] < -1.5 or game_state['ball_z'] > 1.5:
            game_state['ball_direction_z'] *= -1

        # paddles collision
        if (game_state['ball_x'] < -2.3 and abs(game_state['ball_z'] - game_state['paddle1_z']) < 0.5) :
            game_state['ball_direction_x'] *= -1
            game_state['ball_direction_z'] = (game_state['ball_z'] - game_state['paddle1_z']) * 1.5
            game_state['ball_speed'] *= 1.02
        
        if (game_state['ball_x'] > 2.3 and abs(game_state['ball_z'] - game_state['paddle2_z']) < 0.5):
            game_state['ball_direction_x'] *= -1
            game_state['ball_direction_z'] = (game_state['ball_z'] - game_state['paddle2_z']) * 1.5
            game_state['ball_speed'] *= 1.02

        # goal scored
        if game_state['ball_x'] < -2.6 or game_state['ball_x'] > 2.6:
            game_state['ball_direction_x'] = 1
            game_state['ball_direction_z'] = 1
            if game_state['ball_x'] < 0:
                game_state['scoreP2'] += 1
            else:
                game_state['scoreP1'] += 1
            game_state['is_paused'] = True
            game_state['ball_x'] = 0
            game_state['ball_z'] = 0


    async def send_game_state(self, user1, user2):
        if user1 in pvp2d_game_states:
            game_state = pvp2d_game_states[user1]
        elif user2 in pvp2d_game_states:
            game_state = pvp2d_game_states[user2]
        if user1 in pvp2d_user_channels:
            await self.channel_layer.send(pvp2d_user_channels[user1].channel_name, {
                'type': 'game_state',
                'game_state': game_state
            })
        if user2 in pvp2d_user_channels:
            await self.channel_layer.send(pvp2d_user_channels[user2].channel_name, {
                'type': 'game_state',
                'game_state': game_state
            })

    async def send_gamestate_periodically(self, user1, user2):
        try:
            while user1 in pvp2d_matched_users or user2 in pvp2d_matched_users:
                await asyncio.sleep(0.060)
                if self.username in pvp2d_game_states:
                    self.update_ball_position(pvp2d_game_states[self.username])
                    await self.send_game_state(user1, user2)
        except asyncio.CancelledError:
            logger.warning(f"Task for {self.username} was cancelled")
            raise

    def init_gamestate(self):
        return {
            'is_paused': True,
            'paddle1_z': 0,
            'paddle2_z': 0,
            'ball_x': 0,
            'ball_z': 0,
            'ball_direction_x': 1,
            'ball_direction_z': 1,
            'scoreP1': 0,
            'scoreP2': 0,
            'ball_speed': BALL_SPEED,
        }
    
    async def disconnect(self, close_code):
        if self.username:
            if self.username in pvp2d_matchmaking_pool:
                pvp2d_matchmaking_pool.remove(self.username)
            if self.username in pvp2d_pools:
                pvp2d_pools.pop(self.username)
            if self.username in pvp2d_matched_users:
                countdown_task = asyncio.create_task(self.start_reconnect_countdown(self.username))
                logger.warning(f"Starting countdown task for {self.username}")
                pvp2d_disconnected_users[self.username] = {
                    'task': countdown_task,
                    'player_id': self.player_id,
                    'names': {'player1': self.username, 'player2': pvp2d_matched_users[self.username]},
                    'game_state': pvp2d_game_states[self.username],
                }
            pvp2d_user_channels.pop(self.username, None)


    async def start_reconnect_countdown(self, username):
        start_time = asyncio.get_event_loop().time()
        opponent = pvp2d_matched_users[username]
        while opponent not in pvp2d_disconnected_users and asyncio.get_event_loop().time() - start_time < 5:
            await asyncio.sleep(1)
        if username in pvp2d_disconnected_users:
            pvp2d_disconnected_users.pop(username)
            if opponent not in pvp2d_disconnected_users:
                await self.channel_layer.send(pvp2d_user_channels[opponent].channel_name, {'type': 'opponent_disconnected'})
            else:
                pvp2d_disconnected_users.pop(opponent)
            await self.update_game_result(pvp2d_game_states[username], winner=opponent)
        if username in pvp2d_send_gamestate_tasks:
            logger.warning(f"Cancelling task for {username}")
            pvp2d_send_gamestate_tasks[username].cancel()
            pvp2d_send_gamestate_tasks.pop(username)
        if opponent in pvp2d_send_gamestate_tasks:
            logger.warning(f"Cancelling task for {opponent}")
            pvp2d_send_gamestate_tasks[opponent].cancel()
            pvp2d_send_gamestate_tasks.pop(opponent)

    def update_tournament_match(self, match_id, winner, player1, player2):
        try:
            match = TournamentMatch.objects.get(id=match_id)
            match.winner = player1 if winner == 'player1' else player2
            match.save()

            next_match, _ = TournamentMatch.objects.get_or_create(tournament=match.tournament, round=2, position=1)
            if next_match == match:
                return
            if match.position % 2 == 0:
                next_match.player1 = match.winner
            else:
                next_match.player2 = match.winner
            next_match.save()
        except Exception as e:
            logger.error(f"Error updating tournament match: {e}")

    @database_sync_to_async
    def update_game_result(self, gamestate, winner=None):
        if self.username not in pvp2d_matched_users or pvp2d_matched_users[self.username] not in pvp2d_matched_users:
            return

        username1, username2 = self.username, pvp2d_matched_users[self.username]
        scoreP1, scoreP2 = gamestate['scoreP1'], gamestate['scoreP2']
        if not winner:
            winner = 'player1' if scoreP1 > scoreP2 else 'player2'

        try:
            match = Match.objects.filter(
                Q(username1=username1, username2=username2) | Q(username1=username2, username2=username1)
            ).latest('datetime')

            match.winner = username1 if winner == 'player1' else username2
            match.scoreP1 = scoreP1
            match.scoreP2 = scoreP2
            # Use simplified Elo calculation
            match.ratingP1 = self.calculate_elo(username1)
            match.ratingP2 = self.calculate_elo(username2)
            match.save()

            if self.match_id:
                self.update_tournament_match(self.match_id, winner, username1, username2)

            pvp2d_matched_users.pop(username1)
            pvp2d_matched_users.pop(username2)
        except Match.DoesNotExist:
            logger.error(f"Match does not exist for users: {username1}, {username2}")
        except Exception as e:
            logger.error(f"Error updating game result: {e}")

    def calculate_elo(self, username):
        matches = Match.objects.filter(Q(username1=username) | Q(username2=username))
        total_matches = matches.count()
        wins = matches.filter(winner=username).count()
        if total_matches == 0:
            return 1000  # Starting Elo

        win_rate = wins / total_matches
        # Lower rating change as more games are played
        rating_change = 200 * (win_rate - 0.5) / (1 + total_matches ** 0.5)

        new_rating = 1000 + rating_change  # Base rating of 1000
        return new_rating

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        if not message_type:
            logger.warning("No message type found in data: %s", data)
            return

        if message_type == 'game_event':
            await self.process_game_event(data)
        
    async def process_game_event(self, data):
        event = data.get('event')
        if event == 'player_move':
            await self.handle_player_move(data)
        elif event == 'start':
            await self.handle_start()
        elif event == 'end':
            await self.handle_end()

    async def handle_player_move(self, data):
        player_id = data.get('player_id')
        position = data.get('position')
        game_state = pvp2d_game_states[self.username]
        if player_id == '1':
            game_state['paddle1_z'] = position
        elif player_id == '2':
            game_state['paddle2_z'] = position
    
    async def handle_start(self):
        game_state = pvp2d_game_states[self.username]
        game_state['is_paused'] = False
    
    async def handle_end(self):
        logger.warning("ending")
        opponent = pvp2d_matched_users.get(self.username)
        if self.username in pvp2d_send_gamestate_tasks:
            logger.warning(f"Cancelling task for {self.username}")
            pvp2d_send_gamestate_tasks[self.username].cancel()
            pvp2d_send_gamestate_tasks.pop(self.username)
        if opponent in pvp2d_send_gamestate_tasks:
            logger.warning(f"Cancelling task for {opponent}")
            pvp2d_send_gamestate_tasks[opponent].cancel()
            pvp2d_send_gamestate_tasks.pop(opponent)
        game_state = pvp2d_game_states[self.username]
        await self.update_game_result(game_state)
        await self.send(text_data=json.dumps({'type': 'game_end'}))

    async def send_error_message(self, error_type, code, message=None):
        logger.warning(f"{error_type}: {message}")
        await self.send(text_data=json.dumps({
            'type': error_type,
            'message': message
        })) 
        await self.close(code=code)

    async def match_found(self, event):
        player_id = event['player_id']
        names = event.get('names', None)
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'player_id': player_id,
            'names': names,
            'game_state': event.get('game_state')
        }))
    
    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'game_state': event['game_state']
        }))
    
    async def opponent_disconnected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'opponent_disconnected',
            'message': event['event']
        }))

#frontend has to receive:
# match_found
# game_state
# opponent_disconnected
#frontend has to send:
# game_event : player_move{plyer_id, position}, start


# Global variables for TictactoeConsumer
tictactoe_pool = []
tictactoe_matched_users = {}
tictactoe_user_channels = {}
tictactoe_game_states = {}
tictactoe_matchmaking_pool = []

class TictactoeConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.username = None
        self.player_id = None

    async def connect(self):
        await self.accept()
        query_params = parse_qs(self.scope['query_string'].decode())
        token = query_params.get('token', [None])[0]
        self.invite_code = query_params.get('invite', [None])[0]
        self.match_id = query_params.get('match_id', [None])[0]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            self.username = payload.get('username')
            if not self.username:
                raise jwt.InvalidTokenError("Username not found in token")
            
            tictactoe_user_channels[self.username] = self
            if self.username not in tictactoe_matchmaking_pool and self.username not in tictactoe_matched_users:
                tictactoe_matchmaking_pool.append(self.username)
            
            if len(tictactoe_matchmaking_pool) >= 2:
                await self.match_users()
        except jwt.ExpiredSignatureError:
            await self.send_error_message('token_expired', 4001)
        except jwt.InvalidTokenError as e:
            await self.send_error_message('invalid_token', 4002, str(e))

    async def match_users(self, user1=None, user2=None):
        if user1 and user2:
            tictactoe_matched_users[user1] = user2
            tictactoe_matched_users[user2] = user1
        else:
            user1 = tictactoe_matchmaking_pool.pop(0)
            user2 = tictactoe_matchmaking_pool.pop(0)
            tictactoe_matched_users[user1] = user2
            tictactoe_matched_users[user2] = user1

        self.player_id = '1' if user1 == self.username else '2'

        shared_game_state = self.init_gamestate()
        tictactoe_game_states[user1] = shared_game_state
        tictactoe_game_states[user2] = shared_game_state

        if user1 in tictactoe_user_channels:
            await self.channel_layer.send(
                tictactoe_user_channels[user1].channel_name,
                {
                    'type': 'match_found',
                    'player_id': '1',
                    'names': {'player1': user1, 'player2': user2},
                    'game_state': shared_game_state,
                    'role': 'X'
                }
            )
        if user2 in tictactoe_user_channels:
            await self.channel_layer.send(
                tictactoe_user_channels[user2].channel_name,
                {
                    'type': 'match_found',
                    'player_id': '2',
                    'names': {'player1': user1, 'player2': user2},
                    'game_state': shared_game_state,
                    'role': 'O'
                }
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'game_event':
            if data.get('event') == 'move':
                await self.handle_move(data)

    async def handle_move(self, data):
        game_state = tictactoe_game_states[self.username]
        position = data.get('position')
        if game_state['board'][position] is None:
            game_state['board'][position] = game_state['currentPlayer']
            game_state['winner'] = self.check_winner(game_state['board'])
            game_state['currentPlayer'] = 'O' if game_state['currentPlayer'] == 'X' else 'X'
            if game_state['winner']:
                await self.channel_layer.send(
                    tictactoe_user_channels[tictactoe_matched_users[self.username]].channel_name, {'type': 'processing'})
                await self.send(text_data=json.dumps({'type': 'processing'}))
                await self.update_results(self.username)
                await self.channel_layer.send(
                    tictactoe_user_channels[tictactoe_matched_users[self.username]].channel_name,
                    {
                        'type': 'game_end',
                        'game_state': game_state
                    }
                )
                await self.send(text_data=json.dumps({'type': 'game_end', 'game_state': game_state}))
            else:
                await self.send_game_state()

    async def game_end(self, event):
        game_state = event['game_state']
        await self.send(text_data=json.dumps({
            'type': 'game_end',
            'game_state': game_state
        }))

    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'game_state': event['game_state']
        }))

    async def send_game_state(self):
        game_state = tictactoe_game_states[self.username]
        await self.channel_layer.send(
            tictactoe_user_channels[self.username].channel_name,
            {
                'type': 'game_state',
                'game_state': game_state
            }
        )
        opponent = tictactoe_matched_users[self.username]
        await self.channel_layer.send(
            tictactoe_user_channels[opponent].channel_name,
            {
                'type': 'game_state',
                'game_state': game_state
            }
        )

    def init_gamestate(self):
        return {
            'currentPlayer': 'X',
            'role': 'X',
            'board': [None] * 9,
            'winner': None
        }

    async def disconnect(self, close_code):
        if self.username:
            if self.username in tictactoe_matchmaking_pool:
                tictactoe_matchmaking_pool.remove(self.username)
            if self.username in tictactoe_matched_users:
                opponent = tictactoe_matched_users.pop(self.username)
                tictactoe_matched_users.pop(opponent, None)
                if opponent in tictactoe_user_channels:
                    await self.channel_layer.send(
                        tictactoe_user_channels[opponent].channel_name,
                        {
                            'type': 'opponent_disconnected',
                        }
                    )
                    await self.update_results(opponent)
            tictactoe_user_channels.pop(self.username, None)
        await super().disconnect(close_code)

    async def match_found(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'player_id': event['player_id'],
            'names': event['names'],
            'game_state': event['game_state'],
            'role': event['role']
        }))

    async def processing(self, event):
        await self.send(text_data=json.dumps({
            'type': 'processing'
        }))
    
    def check_winner(self, board):
        lines = [
            (0,1,2), (3,4,5), (6,7,8),
            (0,3,6), (1,4,7), (2,5,8),
            (0,4,8), (2,4,6)
        ]
        for a, b, c in lines:
            if board[a] and board[a] == board[b] and board[b] == board[c]:
                return board[a]
        if None not in board:
            return "Draw"
        return None
    
    async def opponent_disconnected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'opponent_disconnected',
        }))

    @database_sync_to_async
    def update_results(self, winner_username):
        try:
            opponent = tictactoe_matched_users.get(self.username)
            if not opponent:
                return
            username1, username2 = self.username, opponent
            scoreP1 = 1 if winner_username == username1 else 0
            scoreP2 = 1 if winner_username == username2 else 0

            Match.objects.create(
                username1=username1,
                username2=username2,
                scoreP1=scoreP1,
                scoreP2=scoreP2,
                winner=winner_username
            )
        except Exception as e:
            logger.error(f"Error storing Tictactoe match results: {e}")

    async def send_error_message(self, error_type, code, message=None):
        logger.warning(f"{error_type}: {message}")
        await self.send(text_data=json.dumps({
            'type': error_type,
            'message': message
        }))
        await self.close(code=code)

