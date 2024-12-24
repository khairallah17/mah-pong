from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.db.models import Q
from .models import Tournament, Match
from .serializers import TournamentSerializer, MatchSerializer

class TournamentList(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class PlayerMatchHistory(APIView):
    def get(self, request, username):
        matches = Match.objects.filter(Q(username1=username) | Q(username2=username))
        serializer = MatchSerializer(matches, many=True, context={'player': username})
        return Response(serializer.data, status=status.HTTP_200_OK)