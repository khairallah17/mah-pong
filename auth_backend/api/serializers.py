from rest_framework_simplejwt.tokens import Token
from .models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

class   UserSerial(serializers.ModelSerializer):
    class   Meta:
        model = User
        fields = ['id', 'username', 'email']

class   Get_Token_serial(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # stock it on Dectionary
        token['full_name'] = user.profile.full_name
        token['username'] = user.username
        token['email'] = user.email
        # token['bio'] = user.profile.bio
        # token['lvl'] = user.profile.bio
        # token['wallet'] = user.profile.bio
        
        return token
    
class   RegistrationSerial(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    full_name = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        field = ['full_name', 'username', 'email', 'password', 'confirm_password']
    
    def validate(self, attribute):
        if attribute['password'] != attribute['confirm_password']:
            raise serializers.ValidationError(
                {'password' : "Password are not match Retry Please"}
            )
        return attribute
    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        ) #create validate user
        user.set_password(validated_data['password']) #it will be Hashed
        
        user.save()
        
        if "full_name" in validated_data:
            user.profile.full_name = validated_data['full_name']
            user.profile.save()
        
        return user

