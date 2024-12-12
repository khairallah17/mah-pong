from django.shortcuts import render
from rest_framework import generics
from .models import Tournament
from .serializers import TournamentSerializer

class TournamentList(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
