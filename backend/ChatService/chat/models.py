from django.db import models # type: ignore
import uuid
from django.contrib.auth.models import AbstractUser # type: ignore

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
    timestamp = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}: {self.content[:20]}"
