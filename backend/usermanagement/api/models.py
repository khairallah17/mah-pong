import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.db.models import Q
from django.db.models.signals import post_save
from django.utils import timezone
from django.conf import settings
import os
import random

# class Friendlists()

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

    friends = models.ManyToManyField("User", blank=True, related_name="friends")
    
    # Add these new fields for 2FA
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, null=True, blank=True)
    last_login_2fa = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def is_friend(self, user):
        """ Check if a user is in the friends list"""
        return self.friends.filter(id=user.id).exists()

    def add_friends(self,friend):
        """ Add a User as Friend """
        if not self.is_friend(friend):
            self.friends.add(friend)
            friend.friends.add(self)
    
    def remove_friend(self, friend):
        """ Remove a User from Friends """
        if self.is_friend(friend):
            self.friends.remove(self)
            friend.friends.remove(self)
        
    
    def get_friends(self):
        """ Get all friends of the user """
        return self.friends.all()

    def get_firend_count(self):
        """ Get the total friends number of the user """
        return self.friends.count()
    

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

class FriendRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    ], default='pending')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sender', 'receiver')

    def accept(self):
        """ Accepting the friend Request """
        if self.status == 'pending':
            self.status = 'accepted'
            self.save()
            self.sender.add_friends(self.receiver)
            return True
        return False
    
    def decline(self):
        """ decline the friend Request """
        if self.status == 'pending':
            self.status = 'declined'
            self.save()
            return True
        return False

    
    def cancel(self):
        """ Cancel a pending friend Request """
        if self.status == 'pending':
            self.delete()
            return True
        return False
    
    # """
    #     Exemple     
    #         def regular_method(self):  # Has access to instance via 'self'
    #             print(self.some_attribute)     
    #         ==================BUT=================
    #         @staticmethod
    #         def static_method(arg1, arg2):  # No 'self' parameter needed
    #         # Can't access instance attributes
    #             return arg1 + arg2
    # """
    @staticmethod # Mean is used to define a method that doesn't need access to the instance (self) or the class itself.
    def send_request(from_user, to_user):
        """ Sending Request Friendship to another user """
        if from_user != to_user and not from_user.is_friend(to_user):
            request, created = FriendRequest.objects.get_or_create(
                sender=from_user,
                receiver=to_user,
                defaults={'status':'pending'} 
            )
            return created
        return False

    @staticmethod
    def get_pending_request(user):
        """ Get All Pending Friend for the user """
        return FriendRequest.objects.filter(receiver=user, status='pending')


class UserOnlineStatus(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_online = models.BooleanField(default=False)
    last_activity = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} - {'Online' if self.is_online else 'Offline'}"

# Create Online Status Instance With each New USer
@receiver(post_save, sender=User)
def create_online_status(sender, instance, created, **kwargs):
    if created:
        UserOnlineStatus.objects.create(user=instance)

# SAving Online SAtus For each User
@receiver(post_save, sender=User)
def save_online_status(sender, instance, **kwargs):
    instance.useronlinestatus.save()

class Profil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)#,  unique=True) ==> if we use "models.ForeignKey(User, on_delete=models.CASCADE, unique=True)"  #mean When We delete User Profile will delete also
    is_verified = models.BooleanField(default=False)

def create_profile_for_user(sender, instance, created, **keyargs):
    if created:
        Profil.objects.create(user=instance)

#saving Profile users infos
def saving_user_profile(sender, instance, **keyargs):
    instance.profil.save()

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