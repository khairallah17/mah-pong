from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    username = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email' #[ 'username', 'email' ] # the user can login unsing username or email on the username feild
    REQUIRED_FIELDS = [ 'username' ] # on login username feils are important to field