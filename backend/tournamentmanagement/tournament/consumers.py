import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Tournament, TournamentParticipant, TournamentMatch

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.tournament_id = None
        await self.accept()

    async def join_tournament(self, event):
        self.tournament_id = event["tournament_id"]
        await self.channel_layer.group_add(f"tournament_{self.tournament_id}", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'join_tournament':
            await self.join_tournament(data)

    async def start_tournament(self, event):
        # Create initial matches with 8 players
        tournament = await sync_to_async(Tournament.objects.get)(id=self.tournament_id)
        participants = list(tournament.participants.all()[:8])

        # Create quarterfinal matches
        for i in range(0, len(participants), 2):
            await sync_to_async(TournamentMatch.objects.create)(
                tournament=tournament,
                round=1,
                player1=participants[i],
                player2=participants[i+1]
            )
        
        # Notify all users in the tournament group
        await self.channel_layer.group_send(
            f"tournament_{self.tournament_id}",
            {
                "type": "tournament_started",
                "message": "Tournament has started!",
            }
        )

    async def tournament_started(self, event):
        await self.send(text_data=json.dumps(event))
