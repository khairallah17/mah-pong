from rest_framework_simplejwt.tokens import Token # type: ignore
from .models import User, TwoFactorAuthAttempt, Profil, FriendRequest, FriendList
from django.contrib.auth.password_validation import validate_password # type: ignore
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # type: ignore
from rest_framework import serializers # type: ignore
import uuid
from rest_framework_simplejwt.tokens import RefreshToken, TokenError # type: ignore
# from rest_framework import serializers
from django_otp.plugins.otp_totp.models import TOTPDevice # type: ignore
from django_otp.util import random_hex # type: ignore
import pyotp # type: ignore


class   UserSerial(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    
    class   Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'img', 'avatar', 'is_online', 'two_factor_enabled', 'last_login_2fa']
        read_only_fields = ['two_factor_enabled', 'last_login_2fa']

class   Get_Token_serial(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # stock it on Dectionary
        token['fullname'] = user.fullname
        token['username'] = user.username
        token['email'] = user.email
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
        if User.objects.filter(email=email).exists():
            obj.is_verified = True
            obj.save()
        return obj.is_verified

class UserProfileSerializer(serializers.ModelSerializer):
    profil = ProfilSerializer()
    
    class Meta:
        model = User
        fields = ['id', 'fullname', 'username', 'email', 'img', 'avatar', 'profil', 'is_online']
        
    def get_is_online(self, obj):
        return obj.is_online

# Friend Request Serializer
class FriendRequestSerializer(serializers.ModelSerializer):
    receiver = serializers.CharField(write_only=True)  # Accept username string
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'receiver', 'status', 'created_at', 'sender_username', 'receiver_username']
        read_only_fields = ['id', 'status', 'created_at']

    def create(self, validated_data):
        receiver_username = validated_data.pop('receiver')
        try:
            receiver = User.objects.get(username=receiver_username)
            sender = self.context['request'].user

            # Check if request already exists
            existing_request = FriendRequest.objects.filter(
                sender=sender,
                receiver=receiver,
                status=FriendRequest.PENDING
            ).exists()

            if existing_request:
                raise serializers.ValidationError('Friend request already exists')

            if sender == receiver:
                raise serializers.ValidationError('Cannot send friend request to yourself')

            return FriendRequest.objects.create(
                sender=sender,
                receiver=receiver,
                **validated_data
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(f'User {receiver_username} not found')

# Friend List Serializer
class FriendListSerializer(serializers.ModelSerializer):
    friends = UserProfileSerializer(many=True, read_only=True)

    class Meta:
        model = FriendList
        fields = ['user', 'friends'] #, 'is_online', 'last_seen']

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