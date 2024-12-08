from rest_framework_simplejwt.tokens import Token
from .models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
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
        fields = ['id', 'fullname' ,'username', 'email']

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

class Enable2FASerializer(serializers.Serializer):
    otp = serializers.CharField(required=True)  # Changed from 'token' to 'otp'

    def validate(self, attrs):
        user = self.context['request'].user
        otp = attrs.get('otp')
        
        try:
            device = TOTPDevice.objects.get(user=user)
            if not device.verify_token(otp):
                raise serializers.ValidationError("Invalid OTP")
        except TOTPDevice.DoesNotExist:
            raise serializers.ValidationError("2FA device not found")
        
        return attrs

class Verify2FASerializer(serializers.Serializer):
    otp = serializers.CharField(required=True)  # Changed from 'token' to 'otp'
    
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