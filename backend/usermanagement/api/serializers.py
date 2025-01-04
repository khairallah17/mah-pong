from rest_framework_simplejwt.tokens import Token
from .models import User, TwoFactorAuthAttempt, Profil, FriendRequest, UserOnlineStatus
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
import uuid
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
# from rest_framework import serializers
from django_otp.plugins.otp_totp.models import TOTPDevice
from django_otp.util import random_hex
import pyotp


class   UserSerial(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    is_online = serializers.SerializerMethodField()
    friend_count = serializers.SerializerMethodField()
    is_friend = serializers.SerializerMethodField() 
    
    class   Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'nblose', 'nbwin', 
                 'score', 'img', 'avatar', 'two_factor_enabled', 'last_login_2fa',
                 'is_online', 'friend_count', 'is_friend']
        read_only_fields = ['two_factor_enabled', 'last_login_2fa']
    
    def get_is_online(self, obj):
        try:
            return obj.useronlinestatus.is_online
        except UserOnlineStatus.DoesNotExist:
            return False
    
    def get_count_friends(self, obj):
        return obj.friends.count()
    
    def get_is_friend(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.is_friend(obj)


class FriendRequestSerializer(serializers.ModelSerializer):
    sender = UserSerial(read_only=True)
    receiver = UserSerial(read_only=True)
    
    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'status', 'timestamp']
        

class   Get_Token_serial(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # stock it on Dectionary
        token['fullname'] = user.fullname
        # print(user.fullname)
        token['username'] = user.username
        token['email'] = user.email
        token['friend_count'] = user.friends.count()
        # token['bio'] = user.profile.bio
        # token['lvl'] = user.profile.bio
        # token['wallet'] = user.profile.bio
        
        return token
    
class   RegistrationSerial(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    fullname = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['fullname', 'username', 'email', 'password', 'confirm_password']
    
    def validate(self, attribute):
        if attribute['password'] != attribute['confirm_password']:
            raise serializers.ValidationError(
                {'password' : "Password are not match Retry Please"}
            )
        return attribute
    
    # generate an [ID (uuid.uuid4()), username, email] for any user in database
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            id=uuid.uuid4() # Generate ID for all user in database
        ) #create validate user
        user.set_password(validated_data['password']) #it will be Hashed
        
        user.save()
        
        if "fullname" in validated_data:
            user.fullname = validated_data['fullname']
            user.save()
        
        return user
    
class ProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profil
        fields = ['is_verified']

    def get_is_verified(self, obj):
        # Check if user has an email and update verification
        if obj.user.email:
            obj.is_verified = True
            obj.save()
        return obj.is_verified

class UserProfileSerializer(serializers.ModelSerializer):
    profil = ProfilSerializer()
    friends = UserSerial(many=True, read_only=True)
    friend_count = serializers.SerializerMethodField()
    pending_friend_requests = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'fullname', 'username', 'email', 'nblose', 
                 'nbwin', 'score', 'img', 'avatar', 'profil',
                 'friends', 'friend_count', 'pending_friend_requests']
    
    def get_friend_count(self, obj):
        return obj.friends.count()

    def get_pending_friend_requests(self, obj):
        pending_requests = FriendRequest.objects.filter(
            receiver=obj,
            status='pending'
        )
        return FriendRequestSerializer(pending_requests, many=True).data

class LogoutSerial(serializers.Serializer):
    refresh = serializers.CharField()
    
    def validate(self, attrs):# i am cheking if the refresh token are valid or not 
        self.token = attrs['refresh']
        return attrs
    
    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            raise serializers.ValidationError('Invalid or expired token')

class TwoFactorAuthAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = TwoFactorAuthAttempt
        fields = ['timestamp', 'successful', 'ip_address', 'user_agent']