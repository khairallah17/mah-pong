# pylint: disable=no-member
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import    post_save
# Create your models here.


#User are inhiriting from AbstractUser Class
class User(AbstractUser):
    # fullname = models.CharField(max_length=50)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    
    # EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email' #email not username #[ 'username', 'email' ] # the user can login unsing username or email on the username feild
    REQUIRED_FIELDS = [ 'username' ] # on login username feils are important to field
    
    def profile(self):
        profile = Profile.objects.get(user=self)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)#,  unique=True) ==> if we use "models.ForeignKey(User, on_delete=models.CASCADE, unique=True)"  #mean When We delete User Profile will delete also
    fullname = models.CharField(max_length=100)
    # bio, Wallet, Level, XP

#fuction Creating once we create User we create His Profile
def create_profile_for_user(sender, instance, created, **keyargs):
    if created:
        Profile.objects.create(user=instance)

#saving Profile users infos
def saving_user_profile(sender, instance, **keyargs):
    instance.profile.save()

post_save.connect(create_profile_for_user, sender=User)
post_save.connect(saving_user_profile, sender=User)