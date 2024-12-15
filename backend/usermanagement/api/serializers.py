from rest_framework_simplejwt.tokens import Token
from .models import User, Friendship, FriendRequest
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
    
    class   Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'img', 'is_online']

class   Get_Token_serial(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # stock it on Dectionary
        token['fullname'] = user.fullname
        # print(user.fullname)
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

class FriendshipSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ('id', 'friend', 'created_at')

    def get_friend(self, obj):
        request_user = self.context['request'].user
        friend = obj.user2 if obj.user1 == request_user else obj.user1
        return UserSerial(friend).data

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerial(read_only=True)
    to_user = UserSerial(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ('id', 'from_user', 'to_user', 'status', 'created_at')
    
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