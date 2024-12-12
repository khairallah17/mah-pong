import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser



class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Add unique related_name arguments to resolve the accessor clash
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='custom_user_set',  # Unique related name
        related_query_name='custom_user'
    )
    
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_set',  # Unique related name
        related_query_name='custom_user'
    )

    def __str__(self):
        return self.username

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
    # avatars ineed to randomly set avatars to users
    
    # I want username as the login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']