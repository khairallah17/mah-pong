from django.shortcuts import render # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import generics, status # type: ignore
from django.db.models import Q # type: ignore
from .models import Tournament, Match
from .serializers import TournamentSerializer, MatchSerializer, PlayerStatsSerializer

class TournamentList(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class PlayerMatchHistory(APIView):
    def get(self, request, username=None):
        matches = Match.objects.filter(Q(username1=username) | Q(username2=username))
        if not matches.exists():
            return Response({'error': 'No matches found for this player'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MatchSerializer(matches, many=True, context={'player': username})
        return Response(serializer.data, status=status.HTTP_200_OK)

class PlayerStats(APIView):
    def get(self, request, username=None):
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            matches = Match.objects.filter(Q(username1=username) | Q(username2=username))
            latest_match = matches.latest('datetime')
            total_matches = matches.count()
            elo = latest_match.ratingP1 if latest_match.username1 == username else latest_match.ratingP2
            wins = 0
            losses = 0
            for match in matches:
                if match.winner == username:
                    wins += 1
                else:
                    losses += 1
        except Match.DoesNotExist:
            return Response({'error': 'No matches found for this player'}, status=status.HTTP_200_OK)
        
        data = {
            'username': username,
            'wins': wins,
            'losses': losses,
            'elo': elo
        }
        
        serializer = PlayerStatsSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)
