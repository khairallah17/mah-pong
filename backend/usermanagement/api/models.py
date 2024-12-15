import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import Q
from django.utils import timezone



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
    is_two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)
    last_activity = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return self.email

    @property
    def is_online(self):
        return (timezone.now() - self.last_activity).seconds < 300  # 5 minutes threshold
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def get_friends(self):
        """Get all friends for this user"""
        friendships = Friendship.objects.get_friends_for_user(self)
        friend_ids = []
        for friendship in friendships:
            if friendship.user1_id == self.id:
                friend_ids.append(friendship.user2_id)
            else:
                friend_ids.append(friendship.user1_id)
        return User.objects.filter(id__in=friend_ids)
    
    def get_friend_requests(self):
        """Get all pending friend requests for this user"""
        return FriendRequest.objects.filter(to_user=self, status='pending')

class FriendshipManager(models.Manager):
    def create_friendship(self, user1, user2):
        """Create a friendship between two users"""
        if user1.id == user2.id:
            raise ValueError("Users cannot be friends with themselves")
        if self.filter(
            models.Q(user1=user1, user2=user2) | 
            models.Q(user1=user2, user2=user1)
        ).exists():
            raise ValueError("These users are already friends")
        return self.create(user1=user1, user2=user2)

    def are_friends(self, user1, user2):
        """Check if two users are friends"""
        return self.filter(
            models.Q(user1=user1, user2=user2) | 
            models.Q(user1=user2, user2=user1)
        ).exists()
    
    def get_friends_for_user(self, user):
        """Get all friendships for a user"""
        return self.filter(
            models.Q(user1=user) | models.Q(user2=user)
        )

class Friendship(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1_friendships')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2_friendships')
    created_at = models.DateTimeField(auto_now_add=True)
    
    objects = FriendshipManager()
    
    class Meta:
        unique_together = ('user1', 'user2')
        
    def __str__(self):
        try:
            return f"Friendship between {self.user1.email} and {self.user2.email}"
        except:
            return f"Friendship {self.id}"

class FriendRequestManager(models.Manager):
    def create_request(self, from_user, to_user):
        """Create a friend request"""
        if from_user.id == to_user.id:
            raise ValueError("Users cannot send friend requests to themselves")
        
        if Friendship.objects.are_friends(from_user, to_user):
            raise ValueError("These users are already friends")
            
        # Check if there's already a pending request
        existing_request = self.filter(
            from_user=from_user,
            to_user=to_user,
            status='pending'
        ).first()
        
        if existing_request:
            raise ValueError("A friend request already exists")
            
        return self.create(from_user=from_user, to_user=to_user)

    def pending_for_user(self, user):
        """Get all pending friend requests for a user"""
        return self.filter(to_user=user, status='pending')

class FriendRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected')
    ]
    
    from_user = models.ForeignKey(User, related_name='sent_friend_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_friend_requests', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    objects = FriendRequestManager()
    
    class Meta:
        unique_together = ('from_user', 'to_user')
        
    def __str__(self):
        try:
            return f"Friend request from {self.from_user.email} to {self.to_user.email}"
        except:
            return f"Friend request {self.id}"
    
    def accept(self):
        """Accept the friend request and create a friendship"""
        if self.status == 'pending':
            friendship = Friendship.objects.create_friendship(
                user1=self.from_user,
                user2=self.to_user
            )
            self.status = 'accepted'
            self.save()
            return friendship
        raise ValueError("This request cannot be accepted")
    
    def reject(self):
        """Reject the friend request"""
        if self.status == 'pending':
            self.status = 'rejected'
            self.save()
        else:
            raise ValueError("This request cannot be rejected")

    def cancel(self):
        """Cancel the friend request (can only be done by the sender)"""
        if self.status == 'pending':
            self.delete()
        else:
            raise ValueError("This request cannot be cancelled")