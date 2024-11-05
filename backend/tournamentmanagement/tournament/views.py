from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Tournament, TournamentParticipant, TournamentMatch
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

User = get_user_model()

class CreateTournamentView(APIView):
    def post(self, request):
        tournament = Tournament.objects.create(name=request.data.get('name'))
        return Response({"tournament_id": tournament.id, "status": tournament.status}, status=status.HTTP_201_CREATED)


class JoinTournamentView(APIView):
    def post(self, request, tournament_id):
        tournament = get_object_or_404(Tournament, pk=tournament_id, status='waiting')
        user = request.user
        if tournament.participants.count() >= 8:
            return Response({"error": "Tournament is full"}, status=status.HTTP_400_BAD_REQUEST)

        participant, created = TournamentParticipant.objects.get_or_create(tournament=tournament, user=user)
        if created and tournament.participants.count() == 8:
            tournament.status = 'ongoing'
            tournament.save()
            # Trigger tournament start logic here
        return Response({"participant_id": participant.id}, status=status.HTTP_201_CREATED)


class UpdateMatchResultView(APIView):
    def post(self, request, match_id):
        match = get_object_or_404(TournamentMatch, pk=match_id)
        winner_id = request.data.get('winner_id')
        winner = get_object_or_404(TournamentParticipant, pk=winner_id, tournament=match.tournament)

        match.winner = winner
        match.save()

        # Move the winner to the next round logic goes here
        # Update the tournament status if the tournament is over

        return Response({"match_id": match.id, "winner": winner.user.username})
