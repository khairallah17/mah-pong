from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
import jwt
from django.conf import settings
from django.db.models import Q
from .models import Tournament, Match
from .serializers import TournamentSerializer, MatchSerializer, PlayerStatsSerializer
import logging
logger = logging.getLogger(__name__)


# ████████╗ ██████╗ ██╗   ██╗██████╗ ███╗   ██╗ █████╗ ███╗   ███╗███████╗███╗   ██╗████████╗    ██╗     ██╗███████╗████████╗
# ╚══██╔══╝██╔═══██╗██║   ██║██╔══██╗████╗  ██║██╔══██╗████╗ ████║██╔════╝████╗  ██║╚══██╔══╝    ██║     ██║██╔════╝╚══██╔══╝
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
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return Response({"error": "Authorization header missing"}, status=400)

            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            username = payload.get('username')
            email = payload.get('email')
            fullname = payload.get('fullname')

            if not username or not user_id or not email or not fullname:
                raise jwt.InvalidTokenError("invalid token.")
        except jwt.InvalidTokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
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
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return Response({"error": "Authorization header missing"}, status=400)

            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            username = payload.get('username')
            email = payload.get('email')
            fullname = payload.get('fullname')

            if not username or not user_id or not email or not fullname:
                raise jwt.InvalidTokenError("invalid token.")
        except jwt.InvalidTokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
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
