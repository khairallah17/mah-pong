from django.db import models
from django.utils import timezone
from django.conf import settings

class Tournament(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting for players'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed')
    ]

    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f'Tournament {self.name} ({self.status})'


class TournamentParticipant(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='active')  # 'active' or 'eliminated'
    joined_at = models.DateTimeField(default=timezone.now)


class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    round = models.IntegerField()  # 1 for quarterfinals, 2 for semifinals, 3 for finals
    player1 = models.ForeignKey(TournamentParticipant, on_delete=models.SET_NULL, null=True, related_name='player1_matches')
    player2 = models.ForeignKey(TournamentParticipant, on_delete=models.SET_NULL, null=True, related_name='player2_matches')
    winner = models.ForeignKey(TournamentParticipant, on_delete=models.SET_NULL, null=True, related_name='won_matches')
    created_at = models.DateTimeField(default=timezone.now)
