import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.db.models import Q
from django.utils import timezone
from django.conf import settings
import os
import random



class User(AbstractUser):
    fullname = models.CharField(max_length=250)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    nblose = models.IntegerField(default=0)
    nbwin = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    img = models.ImageField(
        upload_to='./',
        default='./pic1.jpeg'
    )
    
    def get_random_image():
        list_avatars = os.listdir(path = './media/avatar')

        return('/avatar/' + random.choice(list_avatars))

    avatar = models.ImageField(
        upload_to='./',
        default=get_random_image
    )
    
    # Add these new fields for 2FA
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, null=True, blank=True)
    last_login_2fa = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def profil(self):
        profile = Profil.objects.get(user=self)

    def update_last_login_2fa(self):
        self.last_login_2fa = timezone.now()
        self.save()

    def disable_2fa(self):
        self.two_factor_enabled = False
        self.two_factor_secret = None
        self.save()

    def enable_2fa(self, secret):
        self.two_factor_enabled = True
        self.two_factor_secret = secret
        self.save()

class Profil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)#,  unique=True) ==> if we use "models.ForeignKey(User, on_delete=models.CASCADE, unique=True)"  #mean When We delete User Profile will delete also
    is_verified = models.BooleanField(default=False)

def create_profile_for_user(sender, instance, created, **keyargs):
    if created:
        Profile.objects.create(user=instance)

#saving Profile users infos
def saving_user_profile(sender, instance, **keyargs):
    instance.profile.save()

# You might also want to add a model to track 2FA attempts for security
class TwoFactorAuthAttempt(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='auth_attempts')
    timestamp = models.DateTimeField(auto_now_add=True)
    successful = models.BooleanField(default=False)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.email if self.user else 'No User'} - {self.timestamp} - {'Success' if self.successful else 'Failed'}"


post_save.connect(create_profile_for_user, sender=User)
post_save.connect(saving_user_profile, sender=User)