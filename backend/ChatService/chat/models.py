from django.db import models # type: ignore
import uuid
from django.contrib.auth.models import AbstractUser # type: ignore
from django.utils.timezone import now

class CustomUser(AbstractUser): 
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fullname = models.CharField(max_length=250)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    img = models.ImageField(
        upload_to='profile_pics/',  # Store images in a profile_pics/ directory
        default='profile_pics/default.jpg'
    )
    
    def __str__(self):
        return self.username


# class Conversation(models.Model):
#     name = models.CharField(max_length=255)
#     users = models.ManyToManyField(CustomUser, related_name='conversations')
#     # feild off  
#     def __str__(self):
#         return self.name


# class Message(models.Model):
#     sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="message_sender")
#     receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="message_receiver")
#     content = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)
#     seen = models.BooleanField(default=False)

#     def __str__(self):
#         return f"From {self.sender.username} to {self.receiver.username}: {self.content[:20]}"
class Conversation(models.Model):
    name = models.CharField(max_length=255)
    user1 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='conversation_user1')
    user2 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='conversation_user2')

    def __str__(self):
        return f"{self.user1.username} - {self.user2.username}"

    def get_messages(self):
        # Filter messages where the conversation involves user1 and user2
        return self.messages.all().order_by('timestamp')


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="message_sender")
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="message_receiver")
    content = models.TextField()
    message_type = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    seen = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}: {self.content[:20]}"

class BlockList(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='blocklist_owner')
    blocked_users = models.ManyToManyField(CustomUser, related_name='blocked_by', blank=True)

    def block_user(self, user_to_block):
        """
        Block a user by adding them to the blocked_users ManyToMany field.
        """
        if self != user_to_block:
            self.blocked_users.add(user_to_block)

    def unblock_user(self, user_to_unblock):
        """
        Unblock a user by removing them from the blocked_users ManyToMany field.
        """
        self.blocked_users.remove(user_to_unblock)

    def is_user_blocked(self, user_to_check):
        """
        Check if a given user is blocked by this user.
        """
        return self.blocked_users.filter(id=user_to_check.id).exists()

    def is_blocked_by(self, user_to_check):
        """
        Check if this user is blocked by another user.
        """
        return BlockList.objects.filter(user=user_to_check, blocked_users=self.user).exists()

    def __str__(self):
        return f"BlockList for {self.user.username}"