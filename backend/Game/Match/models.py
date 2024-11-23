from django.db import models

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
    players = models.Arrayfield(models.CharField(max_length=100), default=list, blank=True)

    def __str__(self):
        return f'Tournament {self.id}'
    
class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    round = models.IntegerField()
    position = models.IntegerField()
    username1 = models.CharField(max_length=100)
    username2 = models.CharField(max_length=100)
    score = models.JSONField(default=dict)
    winner = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tournament', 'round', 'position')

    def __str__(self):
        return f'{self.username1} vs {self.username2}'
