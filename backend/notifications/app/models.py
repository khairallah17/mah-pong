from django.db import models

class Notification(models.Model):
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    read = models.BooleanField(default=False)
    user = models.CharField(max_length=20, blank=True, null=True)
    link = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.user:
            self.user = self.user
        super(Notification, self).save(*args, **kwargs)

    def __str__(self):
        return self.message
