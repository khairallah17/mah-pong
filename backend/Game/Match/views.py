<<<<<<< HEAD
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.db.models import Q
from .models import Tournament, Match, AchievementAssignment
from .serializers import TournamentSerializer, MatchSerializer, PlayerStatsSerializer, AchievementAssignmentSerializer
import requests

class TournamentList(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class PlayerMatchHistory(APIView):
    def get(self, request, username=None):
        matches = Match.objects.filter(Q(username1=username) | Q(username2=username))
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

class UserAchievements(APIView):
    def get(self, request, username=None):
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        user_data = self.get_user_data(username)
        if not user_data:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        user_id = user_data['id']
        achievements = AchievementAssignment.objects.filter(user_id=user_id)
        serializer = AchievementAssignmentSerializer(achievements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_user_data(self, username):
        try:
            response = requests.get(f'http://usermanagement:8000/api/users/{username}/')
            if response.status_code == 200:
                return response.json()
        except requests.RequestException as e:
            print(f"Error fetching user data: {e}")
        return None
=======
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.db.models import Q
from .models import Tournament, Match, AchievementAssignment
from .serializers import TournamentSerializer, MatchSerializer, PlayerStatsSerializer, AchievementAssignmentSerializer
import requests
import logging
logger = logging.getLogger(__name__)


# ████████╗ ██████╗ ██╗   ██╗██████╗ ███╗   ██╗ █████╗ ███╗   ███╗███████╗███╗   ██╗████████╗    ██╗     ██╗███████╗████████╗
# ╚══██╔══╝██╔═══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗████╗ ████║██╔════╝████╗  ██║╚══██╔══╝    ██║     ██║██╔════╝╚══██╔══╝
#    ██║   ██║   ██║██║   ██║██████╔╝██╔██╗ ██║███████║██╔████╔██║█████╗  ██╔██╗ ██║   ██║       ██║     ██║███████╗   ██║   
#    ██║   ██║   ██║██║   ██║██╔══██╗██║╚██╗██║██╔══██║██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║       ██║     ██║╚════██║   ██║   
#    ██║   ╚██████╔╝╚██████╔╝██║  ██║██║ ╚████║██║  ██║██║ ╚═╝ ██║███████╗██║ ╚████║   ██║       ███████╗██║███████║   ██║   
#    ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝       ╚══════╝╚═╝╚══════╝   ╚═╝   

class TournamentList(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer


# ██████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗     ███╗   ███╗ █████╗ ████████╗ ██████╗██╗  ██╗      ██╗  ██╗██╗███████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
# ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗    ████╗ ████║██╔══██╗╚══██╔══╝██╔════╝██║  ██║      ██║  ██║██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
# ██████╔╝██║     ███████║ ╚████╔╝ █████╗  ██████╔╝    ██╔████╔██║███████║   ██║   ██║     ███████║█████╗███████║██║███████╗   ██║   ██║   ██║██████╔╝ ╚████╔╝ 
# ██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗    ██║╚██╔╝██║██╔══██║   ██║   ██║     ██╔══██║╚════╝██╔══██║██║╚════██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝  
# ██║     ███████╗██║  ██║   ██║   ███████╗██║  ██║    ██║ ╚═╝ ██║██║  ██║   ██║   ╚██████╗██║  ██║      ██║  ██║██║███████║   ██║   ╚██████╔╝██║  ██║   ██║   
# ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝      ╚═╝  ╚═╝╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   

class PlayerMatchHistory(APIView):
    def get(self, request, username=None):
        logger.warning("MATCH HISTORY API")
        matches = Match.objects.filter(Q(username1=username) | Q(username2=username))
        serializer = MatchSerializer(matches, many=True, context={'player': username})
        return Response(serializer.data, status=status.HTTP_200_OK)


# ██████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗     ███████╗████████╗ █████╗ ████████╗███████╗
# ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗    ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝
# ██████╔╝██║     ███████║ ╚████╔╝ █████╗  ██████╔╝    ███████╗   ██║   ███████║   ██║   ███████╗
# ██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗    ╚════██║   ██║   ██╔══██║   ██║   ╚════██║
# ██║     ███████╗██║  ██║   ██║   ███████╗██║  ██║    ███████║   ██║   ██║  ██║   ██║   ███████║
# ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝


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

# ██╗   ██╗███████╗███████╗██████╗      █████╗  ██████╗██╗  ██╗██╗███████╗██╗   ██╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗███████╗
# ██║   ██║██╔════╝██╔════╝██╔══██╗    ██╔══██╗██╔════╝██║  ██║██║██╔════╝██║   ██║██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
# ██║   ██║███████╗█████╗  ██████╔╝    ███████║██║     ███████║██║█████╗  ██║   ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║   ███████╗
# ██║   ██║╚════██║██╔══╝  ██╔══██╗    ██╔══██║██║     ██╔══██║██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
# ╚██████╔╝███████║███████╗██║  ██║    ██║  ██║╚██████╗██║  ██║██║███████╗ ╚████╔╝ ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║   ███████║
#  ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝╚══════╝  ╚═══╝  ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝


class UserAchievements(APIView):
    def get(self, request, username=None):
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        user_data = self.get_user_data(username)
        if not user_data:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        user_id = user_data['id']
        achievements = AchievementAssignment.objects.filter(user_id=user_id)
        serializer = AchievementAssignmentSerializer(achievements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_user_data(self, username):
        try:
            response = requests.get(f'http://usermanagement:8000/api/users/{username}/')
            if response.status_code == 200:
                return response.json()
        except requests.RequestException as e:
            print(f"Error fetching user data: {e}")
        return None
>>>>>>> master
