from django.db import models
import random
import string
from django.contrib.postgres.fields import ArrayField
from django.db.models.signals import pre_save
from django.dispatch import receiver

class Match(models.Model):
    username1 = models.CharField(max_length=100)
    username2 = models.CharField(max_length=100)
    score = models.JSONField(default=dict)
    winner = models.CharField(max_length=100, null=True, blank=True)
    datetime = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.username1:
            self.username1 = self.username1[:10]
        if self.username2:
            self.username2 = self.username2[:10]
        if self.winner:
            self.winner = self.winner[:10]
        super(Match, self).save(*args, **kwargs)

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
    # max_players = models.IntegerField(default=4)
    players = ArrayField(models.CharField(max_length=100), default=list, blank=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        super(Tournament, self).save(*args, **kwargs)

    def __str__(self):
        return f'Tournament {self.id}'
    
class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    # code = models.CharField(max_length=10, null= True)
    round = models.IntegerField()
    position = models.IntegerField()
    # scoreP1 = models.IntegerField(default=0)
    # scoreP2 = models.IntegerField(default=0)
    player1 = models.CharField(max_length=100, blank=True, null=True)
    player2 = models.CharField(max_length=100, blank=True, null=True)
    winner = models.CharField(max_length=100, blank=True, null=True)
    player1_ready = models.BooleanField(default=False)
    player2_ready = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.player1:
            self.player1 = self.player1[:10]
        if self.player2:
            self.player2 = self.player2[:10]
        if self.winner:
            self.winner = self.winner[:10]
        super(TournamentMatch, self).save(*args, **kwargs)

# @receiver(pre_save, sender=Tournament)
# def remove_players_from_matches(sender, instance, **kwargs):
#     if instance.pk:
#         previous = Tournament.objects.get(pk=instance.pk)
#         removed_players = set(previous.players) - set(instance.players)
#         if removed_players:
#             TournamentMatch.objects.filter(tournament=instance, player1__in=removed_players).update(player1=None)
#             TournamentMatch.objects.filter(tournament=instance, player2__in=removed_players).update(player2=None)