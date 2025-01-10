from rest_framework import serializers # type: ignore
from .models import Tournament, Match

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'created_at', 'status', 'code', 'players']

class MatchSerializer(serializers.ModelSerializer):
    player = serializers.SerializerMethodField()
    opponent = serializers.SerializerMethodField()
    score_player1 = serializers.SerializerMethodField()
    score_player2 = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'datetime', 'player', 'opponent', 'score_player1', 'score_player2','result', 'time']

    def get_player(self, obj):
        return self.context['player']

    def get_opponent(self, obj):
        if obj.username1 == self.context['player']:
            return obj.username2
        return obj.username1

    def get_score_player1(self, obj):
        return obj.scoreP1

    def get_score_player2(self, obj):
        return obj.scoreP2

    def get_result(self, obj):
        if obj.winner == self.context['player']:
            return 'win'
        return 'loss'

    def get_time(self, obj):
        return obj.datetime.strftime('%H:%M:%S')

class PlayerStatsSerializer(serializers.Serializer):
    username = serializers.CharField()
    wins = serializers.IntegerField()
    losses = serializers.IntegerField()
    elo = serializers.IntegerField()
