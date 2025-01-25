import uuid
from django.db import models # type: ignore
from django.contrib.auth.models import AbstractUser # type: ignore
# from django.db.models import Q
from django.db.models.signals import post_save # type: ignore
from django.dispatch import receiver # type: ignore
from django.utils import timezone # type: ignore
from django.conf import settings # type: ignore
import os
import random



class User(AbstractUser):
    fullname = models.CharField(max_length=250)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)

    def get_random_image_profil():
        list_avatars = os.listdir(path = './media')

        return('/' + random.choice(list_avatars))
    img = models.ImageField(
        upload_to='./',
        default="Default.jpg"
    )
    
    is_online = models.BooleanField(default=False)
    # last_activity = models.DateTimeField(default=timezone.now)
    
    def get_random_image():
        list_avatars = os.listdir(path = './media/avatar')

        return('/avatar/' + random.choice(list_avatars))

    avatar = models.ImageField(
        upload_to='./',
        default=get_random_image
    )
    
    # @property
    # def is_online(self):
    #     # Consider user online if active in last 5 minutes
    #     now = timezone.now()
    #     return (now - self.last_activity).total_seconds() < 300  # 5 minutes
    
    # Add these new fields for 2FA
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, null=True, blank=True)
    last_login_2fa = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def profil(self):
        try:
            return Profil.objects.get(user=self)
        except Profil.DoesNotExist:
            return None

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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s profile"



@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profil.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        if hasattr(instance, 'profile'):
            instance.profile.save()
    except Profil.DoesNotExist:
        Profil.objects.create(user=instance)

# def create_profile_for_user(sender, instance, created, **keyargs):
#     if created:
#         Profil.objects.create(user=instance)

# #saving Profile users infos
# def saving_user_profile(sender, instance, **keyargs):
#     instance.profil.save()


# Fiends Requests Class
class FriendRequest(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    STATUS = [
        (PENDING, 'pending'),
        (ACCEPTED, 'accepted'),
        (REJECTED, 'rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, related_name='sent_friend_requests', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_friend_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=8, choices=STATUS, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['sender', 'receiver']

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"
        
# Friends List
class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='friend_list')
    friends = models.ManyToManyField(User, related_name='friends')

    def __str__(self):
        return f"{self.user.username}'s friends"

    @classmethod
    def add_friend(cls, user1, user2):
        friend_list1, _ = cls.objects.get_or_create(user=user1)
        friend_list2, _ = cls.objects.get_or_create(user=user2)
        
        friend_list1.friends.add(user2)
        friend_list2.friends.add(user1)

    @classmethod
    def remove_friend(cls, user1, user2):
        friend_list1 = cls.objects.filter(user=user1).first()
        friend_list2 = cls.objects.filter(user=user2).first()
        
        if friend_list1:
            friend_list1.friends.remove(user2)
        if friend_list2:
            friend_list2.friends.remove(user1)
    
@receiver(post_save, sender=User)
def create_user_friend_list(sender, instance, created, **kwargs):
    if created:
        FriendList.objects.create(user=instance)


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


post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)
post_save.connect(create_user_friend_list, sender=User)