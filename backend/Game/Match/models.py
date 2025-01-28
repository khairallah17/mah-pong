from django.db import models
import random
import string 
from django.contrib.postgres.fields import ArrayField
import requests

class Match(models.Model):
    mode = models.CharField(max_length=10)
    username1 = models.CharField(max_length=20)
    username2 = models.CharField(max_length=20)
    scoreP1 = models.IntegerField(default=0)
    scoreP2 = models.IntegerField(default=0)
    winner = models.CharField(max_length=20, null=True, blank=True)
    ratingP1 = models.IntegerField(default=1000)
    ratingP2 = models.IntegerField(default=1000)
    datetime = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super(Match, self).save(*args, **kwargs)
        self.check_achievements()

    def check_achievements(self):
        if self.winner:
            user_data = self.get_user_data(self.winner)
            if user_data:
                user_id = user_data['id']

    def get_user_data(self, username):
        try:
            response = requests.get(f'http://usermanagement:8000/api/users/{username}/')
            if response.status_code == 200:
                return response.json()
        except requests.RequestException as e:
            print(f"Error fetching user data: {e}")
        return None

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
    code = models.CharField(max_length=6, unique=True)
    players = ArrayField(models.CharField(max_length=100), default=list, blank=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        super(Tournament, self).save(*args, **kwargs)

    def __str__(self):
        return f'Tournament {self.id}'
    
class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    round = models.IntegerField()
    position = models.IntegerField()
    player1 = models.CharField(max_length=100, blank=True, null=True)
    player2 = models.CharField(max_length=100, blank=True, null=True)
    winner = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super(TournamentMatch, self).save(*args, **kwargs)
