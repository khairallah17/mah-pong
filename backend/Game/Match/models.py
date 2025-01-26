from django.db import models # type: ignore
import random
import string 
from django.contrib.postgres.fields import ArrayField # type: ignore
from django.db.models.signals import post_migrate, post_save # type: ignore
from django.dispatch import receiver # type: ignore
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
                # Check and assign achievements
                if not AchievementAssignment.objects.filter(user_id=user_id, achievement__name="First Win").exists():
                    AchievementAssignment.objects.create(user_id=user_id, achievement=Achievement.objects.get(name="First Win"))
                # Add more achievement checks here

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

class Achievement(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

class AchievementAssignment(models.Model):
    user_id = models.UUIDField()
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_id} - {self.achievement.name}"

@receiver(post_migrate)
def create_achievements(sender, **kwargs):
    if sender.name == 'Match':
        achievements = [
            {"name": "First Win", "description": "Win your first match."},
            {"name": "Champion", "description": "Win a tournament."},
            {"name": "Undefeated", "description": "Win 10 matches in a row."},
            {"name": "Comeback King", "description": "Win a match after being down by 3 points."},
            {"name": "Veteran", "description": "Play 100 matches."},
            {"name": "Quick Finisher", "description": "Win a match in under 1 minute."},
            {"name": "Perfect Game", "description": "Win a match without losing a point."},
        ]

        for achievement in achievements:
            Achievement.objects.get_or_create(name=achievement["name"], defaults={"description": achievement["description"]})