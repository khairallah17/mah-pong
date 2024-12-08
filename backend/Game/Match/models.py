from django.db import models
from django.contrib.postgres.fields import ArrayField

class Match(models.Model):
    username1 = models.CharField(max_length=100)
    username2 = models.CharField(max_length=100)
    score = models.JSONField(default=dict)
    winner = models.CharField(max_length=100, null=True, blank=True)
    datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.username1} vs {self.username2}'

class Tournament(models.Model):
    STATUS_CHOICES = [
        ("waiting", "Waiting"),
        ("active", "Active"),
        ("completed", "Completed"),
    ]
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="waiting")
    # max_players = models.IntegerField(default=4)
    players = ArrayField(models.CharField(max_length=100), default=list, blank=True)

    def __str__(self):
        return f'Tournament {self.id}'
    
class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    round = models.IntegerField()
    position = models.IntegerField()
    scoreP1 = models.IntegerField(default=0)
    scoreP2 = models.IntegerField(default=0)
    player1 = models.CharField(max_length=100, blank=True, null=True)
    player2 = models.CharField(max_length=100, blank=True, null=True)
    winner = models.CharField(max_length=100, blank=True, null=True)
    player1_ready = models.BooleanField(default=False)
    player2_ready = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='waiting')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tournament', 'round', 'position')

    def __str__(self):
        return f'{self.player1} vs {self.player2}'
