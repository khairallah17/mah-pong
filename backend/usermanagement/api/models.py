import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser



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