from django.db import models

class Match(models.Model):
    username1 = models.CharField(max_length=100)
    username2 = models.CharField(max_length=100)
    score = models.JSONField(default=dict)
    winner = models.CharField(max_length=100, null=True, blank=True)
    datetime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.username1} vs {self.username2}'