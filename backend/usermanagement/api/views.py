from django.shortcuts import redirect, get_object_or_404
from django.db import models
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from .models import User, TwoFactorAuthAttempt, FriendRequest, FriendList
from .serializers import Get_Token_serial, RegistrationSerial, UserSerial, LogoutSerial, UserProfileSerializer, FriendRequestSerializer, FriendListSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, views, viewsets
from rest_framework.decorators import action
from django.contrib.auth import authenticate, get_user_model
# For Google Login/registring api
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
import os
from django.conf import settings
import uuid
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import requests
from rest_framework.views import APIView
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from .token_reset_passwordd import account_activation_token
from django.core.mail import send_mail, EmailMessage
import urllib.request
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

from django.utils.decorators import method_decorator
from django.http import JsonResponse
import json

from django_otp.plugins.otp_totp.models import TOTPDevice
import pyotp
import qrcode
import qrcode.image.svg
from io import BytesIO
import base64
from rest_framework_simplejwt.authentication import JWTAuthentication
from datetime import datetime
import time
from django.contrib.auth.hashers import check_password, make_password
import random
import string
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
GCLIENT_ID = os.environ.get('GCLIENT_ID')
GCLIENT_SECRET = os.environ.get('GCLIENT_SECRET')


# """
# ███████╗██╗ ██████╗ ███╗   ██╗    ██╗███╗   ██╗        ██╗    ███████╗██╗ ██████╗ ███╗   ██╗    ██╗   ██╗██████╗     ███████╗██╗███╗   ███╗██████╗ ██╗     ███████╗    ███████╗██╗███████╗██╗     ██████╗ 
# ██╔════╝██║██╔════╝ ████╗  ██║    ██║████╗  ██║       ██╔╝    ██╔════╝██║██╔════╝ ████╗  ██║    ██║   ██║██╔══██╗    ██╔════╝██║████╗ ████║██╔══██╗██║     ██╔════╝    ██╔════╝██║██╔════╝██║     ██╔══██╗
# ███████╗██║██║  ███╗██╔██╗ ██║    ██║██╔██╗ ██║      ██╔╝     ███████╗██║██║  ███╗██╔██╗ ██║    ██║   ██║██████╔╝    ███████╗██║██╔████╔██║██████╔╝██║     █████╗      █████╗  ██║█████╗  ██║     ██║  ██║
# ╚════██║██║██║   ██║██║╚██╗██║    ██║██║╚██╗██║     ██╔╝      ╚════██║██║██║   ██║██║╚██╗██║    ██║   ██║██╔═══╝     ╚════██║██║██║╚██╔╝██║██╔═══╝ ██║     ██╔══╝      ██╔══╝  ██║██╔══╝  ██║     ██║  ██║
# ███████║██║╚██████╔╝██║ ╚████║    ██║██║ ╚████║    ██╔╝       ███████║██║╚██████╔╝██║ ╚████║    ╚██████╔╝██║         ███████║██║██║ ╚═╝ ██║██║     ███████╗███████╗    ██║     ██║███████╗███████╗██████╔╝
# ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ╚═╝╚═╝  ╚═══╝    ╚═╝        ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝ ╚═╝         ╚══════╝╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝╚══════╝    ╚═╝     ╚═╝╚══════╝╚══════╝╚═════╝ 
# """

# Create your views here.
class Get_MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = Get_Token_serial
    
    
    # This POST and GET allow checking for authentication before the token are generated
    # and Raising Our own HTTP response if the user is not authenticated
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(email=email, password=password) # this function are default Django to check user exist and credentials are valid
        
        if user is None:
            return Response(
                {"error": "Invalid Credentials or user does not exist"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if 2FA is enabled for the user
        try:
            device = TOTPDevice.objects.get(user=user, confirmed=True)
            # If 2FA is enabled, require verification code
            verification_code = request.data.get('verification_code')
            if not verification_code:
                return Response({
                    'requires_2fa': True,
                    'message': '2FA verification required'
                }, status=status.HTTP_200_OK)

            totp = pyotp.TOTP(device.key)
            if not totp.verify(verification_code):
                return Response({
                    'error': 'Invalid 2FA verification code'
                }, status=status.HTTP_400_BAD_REQUEST)
        except TOTPDevice.DoesNotExist:
            # 2FA not enabled, proceed with normal login
            pass

        # Set user as online before generating tokens
        user.is_online = True
        user.save(update_fields=['is_online'])
        
        # Generate tokens only if 2FA verification passed or not required
        response = super().post(request)
        token = response.data.get('access')
        refresh_token = response.data.get('refresh')
        
        response.set_cookie(
            key='access_token',
            value=token,
            httponly=True,
            secure=False,  # Set to True if using HTTPS
            samesite='Lax'
        )
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,  # Set to True if using HTTPS
            samesite='Lax'
        )
        message = {
            'message' : f"user ${email} logged in"
        }
        return response
    
    def get(self, request):
        if not request.user.is_authenticated: # checking if the user are not authenticate before 
            return Response(
                {"error": "User is not authenticated"},
                status=status.HTTP_400_BAD_REQUEST
            ) # returning HTTP request if the user are not existed
        
        # here if the user are authenticate we return user info, to generate new token
        return Response(
            {
                "username": request.user.username,
                "email": request.user.email,
                "is_authenticated": True
            }, status=status.HTTP_200_OK
        )
    

class RegisterationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerial
    
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Checking for existence of email or username before registration ====> for email are already handled in django by default
        username = serializer.validated_data.get('username')
        email = serializer.validated_data.get('email')
        if User.objects.filter(username=username).exists() or User.objects.filter(email=email):
            return Response(
                {"error": "A user with that username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If checks pass, create the user
        # Here i called the create method in serializer, to create requirments user fieled
        # this hande object creation, and (serializer.data) provides the representation of the created object
        # Generate a UUID for the new user
        user_id = uuid.uuid4()
        
        # Pass the generated UUID to the serializer's save method
        user = serializer.save(id=user_id)
        
        headers = self.get_success_headers(serializer.data) #
        return Response(
            {
                "message": "User Registered Successfully",
                "UserInfo": {"username": user.username, "email": user.email, "id": str(user.id)}
            }, status=status.HTTP_201_CREATED,
            headers=headers
        )

    def get(self, request):
        return Response(
            {"message": "User is not authenticated"},
            status=status.HTTP_202_ACCEPTED
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated]) # thats mean no one can pass to here util they authenticated 

# """
#  ██████╗     ██╗██╗  ██╗██████╗     ███████╗██╗ ██████╗ ███╗   ██╗    ██╗███╗   ██╗        ██╗    ███████╗██╗ ██████╗ ███╗   ██╗    ██╗   ██╗██████╗ 
# ██╔════╝    ██╔╝██║  ██║╚════██╗    ██╔════╝██║██╔════╝ ████╗  ██║    ██║████╗  ██║       ██╔╝    ██╔════╝██║██╔════╝ ████╗  ██║    ██║   ██║██╔══██╗
# ██║  ███╗  ██╔╝ ███████║ █████╔╝    ███████╗██║██║  ███╗██╔██╗ ██║    ██║██╔██╗ ██║      ██╔╝     ███████╗██║██║  ███╗██╔██╗ ██║    ██║   ██║██████╔╝
# ██║   ██║ ██╔╝  ╚════██║██╔═══╝     ╚════██║██║██║   ██║██║╚██╗██║    ██║██║╚██╗██║     ██╔╝      ╚════██║██║██║   ██║██║╚██╗██║    ██║   ██║██╔═══╝ 
# ╚██████╔╝██╔╝        ██║███████╗    ███████║██║╚██████╔╝██║ ╚████║    ██║██║ ╚████║    ██╔╝       ███████║██║╚██████╔╝██║ ╚████║    ╚██████╔╝██║     
#  ╚═════╝ ╚═╝         ╚═╝╚══════╝    ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ╚═╝╚═╝  ╚═══╝    ╚═╝        ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝     ╚═════╝ ╚═╝     
# """

# Creating Views For Google Login/Signup User using dj-rest-auth's Package
class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173/"
    client_class = OAuth2Client
    
def generate_temp_password(length=12):
    """Generate a secure temporary password"""
    characters = string.ascii_letters + string.digits + "!@"
    return ''.join(random.choice(characters) for i in range(length))


# Creating Google login CallBack views
class GoogleLoginCallback(APIView):
    def get(self, request):
        code = request.GET.get("code")
        if code is None:
            return redirect("http://localhost:5173/login")
    
        token_url  = "https://oauth2.googleapis.com/token"
        try:
            token_data = {
                "code"          : code,
                "client_id"     : GCLIENT_ID,
                "client_secret" : GCLIENT_SECRET,
                "redirect_uri"  : "/api/usermanagement/api/v2/auth/googlelogin/callback/",
                "grant_type"    : "authorization_code"
            }


            token_response = requests.post(token_url, data = token_data)
            if not token_response.ok:
                return redirect("http://localhost:5173/login")
        
            token_JSON = token_response.json()
            if 'access_token' not in token_JSON:
                return redirect("http://localhost:5173/login")

            getInfo = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", params = {'access_token': token_JSON["access_token"]}) # Getting Token To Extraction User Data
            if not getInfo.ok:
                return redirect("http://localhost:5173/login")
            
            email = getInfo.json()["email"]
            username = getInfo.json()['email'].split('@')[0]
        except Exception as e:
            return redirect("http://localhost:5173/login?error=authentication_failed")
        
        #telechargit imaghe dyal google
        urllib.request.urlretrieve(getInfo.json()['picture'], "./media/" + username + ".jpg")
        # Here i want to getting info from database or create if dosent exist

        # Generating Random Password
        tmp_password = generate_temp_password()

        try:
            user = User.objects.get(email=email)
            if not user.password:
                is_password_need = True
            else:
                is_password_need = False
        except User.DoesNotExist:
            user = User.objects.create(
                fullname=getInfo.json()['name'],
                username=username,
                email=email,
                img="./" + username + ".jpg"
            )
            is_password_need = True
            user.save()
        

        # Set user as online before generating tokens
        user.is_online = True
        user.save(update_fields=['is_online'])
        #create Token for This user using JWT "we use RefreshToken because it automaticly create both refresh_token and access_token"
        #we didn't use AccessToken because it automaticly create just access_token"
        # acces_token = Get_Token_serial.get_token(user)
        refresh = Get_Token_serial.get_token(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        url_redirect = (f"http://localhost:5173/google-callback"
                        f"?access_token={access_token}"
                        f"&is_password_need={is_password_need}")

        if is_password_need:
            url_redirect += f"&tmp_password={tmp_password}"


        response = redirect(url_redirect)
        # Set cookies for ggoole API
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,  # Set to True if using HTTPS
            samesite='Lax'
        )
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,  # Set to True if using HTTPS
            samesite='Lax'
        )

        return response



class Login42Auth(APIView):
    def get(self, request):
        code = request.GET.get('code')
        if code is None:
            return redirect("http://localhost:5173/login")
        
        # Sending request to 42 API to Get Token
        get_Token_url = "https://api.intra.42.fr/oauth/token"
        try:
            # this is Requarments data should to get Token from 42 API
            Token_data = {
                'code'          : code,
                "client_id"     : CLIENT_ID,
                "client_secret" : CLIENT_SECRET,
                "redirect_uri"  : "/api/usermanagement/api/42login/callback/",
                "grant_type"    : "authorization_code"
            }
        
            # Sendding Now Request to 42 API to getting return the Access_Token
            request_token = requests.post(get_Token_url, data = Token_data)
            if not request_token.ok:
                return redirect("http://localhost:5173/login")
        
            token_json = request_token.json()
            if 'access_token' not in token_json:
                return redirect("http://localhost:5173/login")

            # extracting information From Token Now Hnaya
            getInfoUser = requests.get("https://api.intra.42.fr/v2/me", headers={'Authorization': f'Bearer {token_json["access_token"]}'})
            if not getInfoUser.ok:
                return redirect("http://localhost:5173/login")
        

            username = getInfoUser.json().get('login')
            email = getInfoUser.json().get('email')
        except Exception as e:
            return redirect("http://localhost:5173/login?error=authentication_failed")
        
        #telechargit imaghe dyal intra
        urllib.request.urlretrieve(getInfoUser.json().get('image')['link'], "./media/" + username + ".jpg")
        

        # Creating Random Password for user logged using 42API
        tmp_password = generate_temp_password()
        try:
            user = User.objects.get(email=email)
            valid_password = check_password(tmp_password, user.password)
            if not user.password:
                is_password_need = True
            else:
                is_password_need = False
        except User.DoesNotExist:
            user = User.objects.create(
                fullname=getInfoUser.json().get('displayname'),
                username=username,
                email=email,
                img="./" + username + ".jpg"
            )
            is_password_need = True
            user.save()

        # Set user as online before generating tokens
        user.is_online = True
        user.save(update_fields=['is_online'])
        # now sending access token to Front
                # Generate tokens
        refresh = Get_Token_serial.get_token(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        url_redirect = (f"http://localhost:5173/42intra-callback" 
                            f"?access_token={access_token}"
                            f"&is_password_need={is_password_need}")

        if is_password_need:
            url_redirect += f"&tmp_password={tmp_password}"
        
        response = redirect(url_redirect)
        # Set cookies
        response.set_cookie(
            key='access_token',
            value=access_token,
            httponly=True,
            secure=False,  # Set to True if using HTTPS
            samesite='Lax'
        )
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=False,  # Set to True if using HTTPS
            samesite='Lax'
        )

        return response

# """
# ███████╗███████╗████████╗████████╗██╗███╗   ██╗ ██████╗     ██████╗  █████╗ ███████╗███████╗██╗    ██╗ ██████╗ ██████╗ ██████╗     ███████╗ ██████╗ ██████╗     ██╗  ██╗██████╗     ██╗ ██████╗      █████╗ ██████╗ ██╗
# ██╔════╝██╔════╝╚══██╔══╝╚══██╔══╝██║████╗  ██║██╔════╝     ██╔══██╗██╔══██╗██╔════╝██╔════╝██║    ██║██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝██╔═══██╗██╔══██╗    ██║  ██║╚════██╗   ██╔╝██╔════╝     ██╔══██╗██╔══██╗██║
# ███████╗█████╗     ██║      ██║   ██║██╔██╗ ██║██║  ███╗    ██████╔╝███████║███████╗███████╗██║ █╗ ██║██║   ██║██████╔╝██║  ██║    █████╗  ██║   ██║██████╔╝    ███████║ █████╔╝  ██╔╝ ██║  ███╗    ███████║██████╔╝██║
# ╚════██║██╔══╝     ██║      ██║   ██║██║╚██╗██║██║   ██║    ██╔═══╝ ██╔══██║╚════██║╚════██║██║███╗██║██║   ██║██╔══██╗██║  ██║    ██╔══╝  ██║   ██║██╔══██╗    ╚════██║██╔═══╝  ██╔╝  ██║   ██║    ██╔══██║██╔═══╝ ██║
# ███████║███████╗   ██║      ██║   ██║██║ ╚████║╚██████╔╝    ██║     ██║  ██║███████║███████║╚███╔███╔╝╚██████╔╝██║  ██║██████╔╝    ██║     ╚██████╔╝██║  ██║         ██║███████╗██╔╝   ╚██████╔╝    ██║  ██║██║     ██║
# ╚══════╝╚══════╝   ╚═╝      ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═╝      ╚═════╝ ╚═╝  ╚═╝         ╚═╝╚══════╝╚═╝     ╚═════╝     ╚═╝  ╚═╝╚═╝     ╚═╝
# """

class SetPasswordForApi(APIView):
    def post(self, request):
        user = request.user
        new_password = request.data.get('new_password')
        tmp_password = request.data.get('tmp_password')

        if not new_password:
            return Response(
                {'error': 'New Password is Required'},
                status=400
            )

        user.password = make_password(new_password)
        user.save()

        return Response({'message': 'Password set successfully'})

# """
# ███████╗ ██████╗ ██████╗  ██████╗  ██████╗ ████████╗    ██████╗  █████╗ ███████╗███████╗██╗    ██╗ ██████╗ ██████╗ ██████╗     ███████╗███╗   ███╗████████╗██████╗ 
# ██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔═══██╗╚══██╔══╝    ██╔══██╗██╔══██╗██╔════╝██╔════╝██║    ██║██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝████╗ ████║╚══██╔══╝██╔══██╗
# █████╗  ██║   ██║██████╔╝██║  ███╗██║   ██║   ██║       ██████╔╝███████║███████╗███████╗██║ █╗ ██║██║   ██║██████╔╝██║  ██║    ███████╗██╔████╔██║   ██║   ██████╔╝
# ██╔══╝  ██║   ██║██╔══██╗██║   ██║██║   ██║   ██║       ██╔═══╝ ██╔══██║╚════██║╚════██║██║███╗██║██║   ██║██╔══██╗██║  ██║    ╚════██║██║╚██╔╝██║   ██║   ██╔═══╝ 
# ██║     ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝   ██║       ██║     ██║  ██║███████║███████║╚███╔███╔╝╚██████╔╝██║  ██║██████╔╝    ███████║██║ ╚═╝ ██║   ██║   ██║     
# ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝       ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚══════╝╚═╝     ╚═╝   ╚═╝   ╚═╝     
# """

# class   Send_Reset_Password(View):
@api_view(['POST'])
def send_resetpass(request): #sending email 
    email = request.data.get('email')

    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        uidb64 = urlsafe_base64_encode(force_bytes(str(user.id)))
        gen_token = account_activation_token.make_token(user)
        reset_url = f"/api/usermanagement/api/password-reset/{uidb64}/{gen_token}/"
        
        subject = 'Password Reset Request'
        message = f"""
        Hello,

        You have requested to reset your password. Please click the link below:

        {reset_url}

        If you did not request this reset, please ignore this email.

        Thanks,
        Your App Team
        """
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )

        return Response({'message': 'Password reset email has been sent.'}, status=200)
    return Response({'error': 'Email not found'}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class   Confirm_reset_Password(View):
    def get(self, request, uidb64, token):
        try:
            # Decode the user ID
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=uid)
            
            if not account_activation_token.check_token(user, token): # checking if the token are valid or not
                return HttpResponseRedirect(
                    f"http://localhost:5173/password-reset/error"
                ) # if the token are not valid kan redirectih l error front page
            # o ila kan Token valide so khassni nsift bach ibdel password
            return HttpResponseRedirect(
                    f"http://localhost:5173/password-reset/confirm?uidb64={uidb64}&token={token}" # hady katsma Query Method kay3ni kansifto lfront o kaninjikti fih <uidb64> o <token>
            )
        except(TypeError, ValueError, User.DoesNotExist):
            return HttpResponseRedirect(
                f"http://localhost:5173/password-reset/error" # hnaya aya error jani awla ila makansh user kanredirectih lpage error
            )

    def post(self, request, uidb64, token):
        try:

            # Parse the request body properly
            try:
                data = json.loads(request.body)
                new_password = data.get('new_password')
                confirm_password = data.get('confirm_password')
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON data'}, status=400)

            # Decode the user ID
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(id=uid)
            except (TypeError, ValueError, User.DoesNotExist):
                return JsonResponse({'error': 'Invalid reset link'}, status=400)

            # Verify token
            if not account_activation_token.check_token(user, token):
                return JsonResponse({'error': 'Invalid or expired token'}, status=400)

            # Validate passwords
            if not new_password or not confirm_password:
                return JsonResponse({'error': 'Both passwords are required'}, status=400)

            if new_password != confirm_password:
                return JsonResponse({'error': 'Passwords do not match'}, status=400)

            # Set new password
            user.set_password(new_password)
            user.save()

            return JsonResponse({'message': 'Password reset successful'}, status=200)

        except Exception as e:
            return JsonResponse({'error': 'An error occurred'}, status=400)

    def options(self, request, *args, **kwargs):
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
        return response

# """
# ██╗      ██████╗  ██████╗  ██████╗ ██╗   ██╗████████╗    ██████╗ ██╗      █████╗  ██████╗██╗  ██╗██╗     ██╗███████╗████████╗██╗███╗   ██╗ ██████╗     ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗
# ██║     ██╔═══██╗██╔════╝ ██╔═══██╗██║   ██║╚══██╔══╝    ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝██║     ██║██╔════╝╚══██╔══╝██║████╗  ██║██╔════╝     ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║
# ██║     ██║   ██║██║  ███╗██║   ██║██║   ██║   ██║       ██████╔╝██║     ███████║██║     █████╔╝ ██║     ██║███████╗   ██║   ██║██╔██╗ ██║██║  ███╗       ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║
# ██║     ██║   ██║██║   ██║██║   ██║██║   ██║   ██║       ██╔══██╗██║     ██╔══██║██║     ██╔═██╗ ██║     ██║╚════██║   ██║   ██║██║╚██╗██║██║   ██║       ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║
# ███████╗╚██████╔╝╚██████╔╝╚██████╔╝╚██████╔╝   ██║       ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗███████╗██║███████║   ██║   ██║██║ ╚████║╚██████╔╝       ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║
# ╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝       ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝        ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
# """

class LogoutViews(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Set user offline
            User.objects.filter(id=request.user.id).update(is_online=False)
            
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                # Create RefreshToken instance and blacklist it
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception as e:
                    return Response({'error': f"Error blacklisting token: {str(e)}"})
                    # Continue with logout even if blacklisting fails

            # Create response and delete cookies
            response = Response(
                {'message': 'Successfully logged out'}, 
                status=status.HTTP_200_OK
            )
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')

            return response
            
        except Exception as e:
            # Still try to delete cookies even if there's an error
            response = Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response

# """
#  ██████╗██████╗ ███████╗ █████╗ ████████╗██╗███╗   ██╗ ██████╗     ██████╗ ██████╗  ██████╗ ███████╗██╗██╗     ███████╗    ███████╗ ██████╗ ██████╗     ██╗   ██╗███████╗███████╗██████╗ ███████╗
# ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██║████╗  ██║██╔════╝     ██╔══██╗██╔══██╗██╔═══██╗██╔════╝██║██║     ██╔════╝    ██╔════╝██╔═══██╗██╔══██╗    ██║   ██║██╔════╝██╔════╝██╔══██╗██╔════╝
# ██║     ██████╔╝█████╗  ███████║   ██║   ██║██╔██╗ ██║██║  ███╗    ██████╔╝██████╔╝██║   ██║█████╗  ██║██║     █████╗      █████╗  ██║   ██║██████╔╝    ██║   ██║███████╗█████╗  ██████╔╝███████╗
# ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║██║╚██╗██║██║   ██║    ██╔═══╝ ██╔══██╗██║   ██║██╔══╝  ██║██║     ██╔══╝      ██╔══╝  ██║   ██║██╔══██╗    ██║   ██║╚════██║██╔══╝  ██╔══██╗╚════██║
# ╚██████╗██║  ██║███████╗██║  ██║   ██║   ██║██║ ╚████║╚██████╔╝    ██║     ██║  ██║╚██████╔╝██║     ██║███████╗███████╗    ██║     ╚██████╔╝██║  ██║    ╚██████╔╝███████║███████╗██║  ██║███████║
#  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝     ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
# """

class UserProfileApi(APIView):
    def get(self, request, username):
        try:
            user = get_object_or_404(User, username=username)
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


def viewallrouting(request):
    data = [
        'api/'
        'api/token/refresh',
        'api/register',
        'api/token',
        'api/logout',
        'api/password-reset'
    ]
    return Response(data)

# """
# ██╗     ██╗███████╗████████╗██╗███╗   ██╗ ██████╗      █████╗ ██╗     ██╗         ██╗   ██╗███████╗███████╗██████╗ ███████╗
# ██║     ██║██╔════╝╚══██╔══╝██║████╗  ██║██╔════╝     ██╔══██╗██║     ██║         ██║   ██║██╔════╝██╔════╝██╔══██╗██╔════╝
# ██║     ██║███████╗   ██║   ██║██╔██╗ ██║██║  ███╗    ███████║██║     ██║         ██║   ██║███████╗█████╗  ██████╔╝███████╗
# ██║     ██║╚════██║   ██║   ██║██║╚██╗██║██║   ██║    ██╔══██║██║     ██║         ██║   ██║╚════██║██╔══╝  ██╔══██╗╚════██║
# ███████╗██║███████║   ██║   ██║██║ ╚████║╚██████╔╝    ██║  ██║███████╗███████╗    ╚██████╔╝███████║███████╗██║  ██║███████║
# ╚══════╝╚═╝╚══════╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═╝╚══════╝╚══════╝     ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
# """

class get_allusers(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        
        users = User.objects.all()
        serializer = UserSerial(users, many=True)
        return Response(serializer.data)

# """
# ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗██╗███╗   ██╗ ██████╗     ██████╗ ██████╗  ██████╗ ███████╗██╗██╗     ███████╗    ██╗███╗   ██╗███████╗ ██████╗ 
# ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║████╗  ██║██╔════╝     ██╔══██╗██╔══██╗██╔═══██╗██╔════╝██║██║     ██╔════╝    ██║████╗  ██║██╔════╝██╔═══██╗
# ██║   ██║██████╔╝██║  ██║███████║   ██║   ██║██╔██╗ ██║██║  ███╗    ██████╔╝██████╔╝██║   ██║█████╗  ██║██║     █████╗      ██║██╔██╗ ██║█████╗  ██║   ██║
# ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██║██║╚██╗██║██║   ██║    ██╔═══╝ ██╔══██╗██║   ██║██╔══╝  ██║██║     ██╔══╝      ██║██║╚██╗██║██╔══╝  ██║   ██║
# ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ██║██║ ╚████║╚██████╔╝    ██║     ██║  ██║╚██████╔╝██║     ██║███████╗███████╗    ██║██║ ╚████║██║     ╚██████╔╝
#  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝    ╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝ 
# """

class UserEditProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerial(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerial(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request):
        user = request.user
        
        # Check if user has a profile image
        if not user.img:
            return Response(
                {"detail": "No profile image to delete"}, 
                status=400
            )
        try:
            user.img.delete()
            user.img = "./Default.jpg"
            user.save()
            
            return Response(
                {"detail": "Profile image deleted successfully"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": f"Error deleting profile image: {str(e)}"},
                status=400
            )
    
# """
# ██████╗ ███████╗ █████╗     ███████╗███╗   ██╗ █████╗ ██████╗ ██╗     ███████╗    ██████╗ ██╗███████╗ █████╗ ██████╗ ██╗     ███████╗    ██╗   ██╗███████╗██████╗ ██╗███████╗██╗   ██╗      ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
# ╚════██╗██╔════╝██╔══██╗    ██╔════╝████╗  ██║██╔══██╗██╔══██╗██║     ██╔════╝    ██╔══██╗██║██╔════╝██╔══██╗██╔══██╗██║     ██╔════╝    ██║   ██║██╔════╝██╔══██╗██║██╔════╝╚██╗ ██╔╝     ██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
#  █████╔╝█████╗  ███████║    █████╗  ██╔██╗ ██║███████║██████╔╝██║     █████╗█████╗██║  ██║██║███████╗███████║██████╔╝██║     █████╗█████╗██║   ██║█████╗  ██████╔╝██║█████╗   ╚████╔╝█████╗██║     ███████║█████╗  ██║     █████╔╝ 
# ██╔═══╝ ██╔══╝  ██╔══██║    ██╔══╝  ██║╚██╗██║██╔══██║██╔══██╗██║     ██╔══╝╚════╝██║  ██║██║╚════██║██╔══██║██╔══██╗██║     ██╔══╝╚════╝╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝    ╚██╔╝ ╚════╝██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ 
# ███████╗██║     ██║  ██║    ███████╗██║ ╚████║██║  ██║██████╔╝███████╗███████╗    ██████╔╝██║███████║██║  ██║██████╔╝███████╗███████╗     ╚████╔╝ ███████╗██║  ██║██║██║        ██║        ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
# ╚══════╝╚═╝     ╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝    ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝      ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝         ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝
# """

class TwoFactorAuthenticationView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        """Generate QR code for Google Authenticator"""
        if not request.user.is_authenticated:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        
        # Get or create TOTP device for user
        device, created = TOTPDevice.objects.get_or_create(
            user=user,
            defaults={'confirmed': False}
        )

        if created or not device.confirmed:
            # Generate new secret key
            secret_key = pyotp.random_base32()
            device.key = secret_key
            device.save()

            # Generate provisioning URI for QR code
            totp = pyotp.TOTP(secret_key)
            provisioning_uri = totp.provisioning_uri(
                name=user.email,
                issuer_name="Ft_transcendence DRARI LMLA7 Team"
            )

            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(provisioning_uri)
            qr.make(fit=True)

            # Create QR code image
            img_qr = qr.make_image(fill_color="black", back_color="white")
            
            # Save QR code image
            img_path = f'qr_codes/qr_{user.username}.png'
            full_path = os.path.join(settings.MEDIA_ROOT, img_path)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # Save the image
            img_qr.save(full_path)

            # Convert to base64 for response
            buffer = BytesIO()
            img_qr.save(buffer, format="PNG")
            qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

            # Generate URL for the QR code image
            qr_image_url = f"{settings.MEDIA_URL}{img_path}"

            return Response({
                'qr_code': qr_code_base64,
                'qr_image_url': qr_image_url,
                'secret_key': secret_key,
                'is_enabled': device.confirmed
            })
        
        # If 2FA is already set up 
        if device.confirmed:
            # Generate URL for existing QR code and sending Qrcode as image in backend
            qr_image_url = f"{settings.MEDIA_URL}qr_codes/qr_{user.username}.png"
            return Response({
                'is_enabled': device.confirmed,
                'message': '2FA is already set up',
                'qr_image_url': qr_image_url
            })
        
        return Response({
            'is_enabled': device.confirmed,
            'message': '2FA is already set up',
            'qr_image_url': None
        })

class Verify2FAView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        otp = request.data.get('otp')

        if not otp:
            return Response({
                'error': 'OTP is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            device = TOTPDevice.objects.get(user=user)
            totp = pyotp.TOTP(device.key)

            if totp.verify(otp):
                device.confirmed = True
                device.save()
                
                # Log successful hnaya kanverfyi ila kan otp enabled o user 3ad tloga
                TwoFactorAuthAttempt.objects.create(
                    user=user,
                    successful=True,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT')
                )

                return Response({
                    'message': '2FA successfully enabled'
                })
            else:
                # Log failed hnaya ila kan OTP disebled sf mkay7tajsh ba9i ivirifyi 2FA
                TwoFactorAuthAttempt.objects.create(
                    user=user,
                    successful=False,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT')
                )
                
                return Response({
                    'error': 'Invalid OTP'
                }, status=status.HTTP_400_BAD_REQUEST)

        except TOTPDevice.DoesNotExist:
            return Response({
                'error': '2FA not set up'
            }, status=status.HTTP_400_BAD_REQUEST)


# class bash T7yed 2FA
class Disable2FAView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            device = TOTPDevice.objects.get(user=request.user)
            device.confirmed = False
            device.save()
            
            # Clean up QR code image if it exists
            qr_image_path = os.path.join(settings.MEDIA_ROOT, f'qr_codes/qr_{request.user.username}.png')
            if os.path.exists(qr_image_path):
                os.remove(qr_image_path)

            # Log the disabling of 2FA
            TwoFactorAuthAttempt.objects.create(
                user=request.user,
                successful=True,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT'),
            )

            return Response({
                'message': '2FA successfully disabled'
            })
        except TOTPDevice.DoesNotExist:
            return Response({
                'error': '2FA was not enabled'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=400)

class Check2FAStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            device = TOTPDevice.objects.get(user=request.user, confirmed=True)
            return Response({
                'requires_2fa': True
            })
        except TOTPDevice.DoesNotExist:
            return Response({
                'requires_2fa': False
            })

# """
# ██╗   ██╗██████╗ ██████╗  █████╗ ████████╗██╗███╗   ██╗ ██████╗      ██████╗ ██╗     ██████╗     ██████╗  █████╗ ███████╗███████╗██╗    ██╗ ██████╗ ██████╗ ██████╗ 
# ██║   ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║████╗  ██║██╔════╝     ██╔═══██╗██║     ██╔══██╗    ██╔══██╗██╔══██╗██╔════╝██╔════╝██║    ██║██╔═══██╗██╔══██╗██╔══██╗
# ██║   ██║██████╔╝██║  ██║███████║   ██║   ██║██╔██╗ ██║██║  ███╗    ██║   ██║██║     ██║  ██║    ██████╔╝███████║███████╗███████╗██║ █╗ ██║██║   ██║██████╔╝██║  ██║
# ██║   ██║██╔═══╝ ██║  ██║██╔══██║   ██║   ██║██║╚██╗██║██║   ██║    ██║   ██║██║     ██║  ██║    ██╔═══╝ ██╔══██║╚════██║╚════██║██║███╗██║██║   ██║██╔══██╗██║  ██║
# ╚██████╔╝██║     ██████╔╝██║  ██║   ██║   ██║██║ ╚████║╚██████╔╝    ╚██████╔╝███████╗██████╔╝    ██║     ██║  ██║███████║███████║╚███╔███╔╝╚██████╔╝██║  ██║██████╔╝
#  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝      ╚═════╝ ╚══════╝╚═════╝     ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝ ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝ 
# """

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Parse the request body properly
            try:
                old_password = request.data.get('old_password')
                new_password = request.data.get('new_password')
                confirm_password = request.data.get('confirm_password')
            except (TypeError, ValueError):
                return Response({'error': 'Invalid JSON data'})

            # Decode the user ID
            user = request.user
            if not old_password:
                return Response({'error': 'Old password is required'})
            # user = User.objects.get(email=user.email)
            try:
                valid_password = check_password(old_password, user.password)
                if not valid_password:
                    return Response({'error': 'Invalid old password'},status=200)
            except Exception as e:
                return Response({'error': 'Error validating password'}, status=400)

            # Validate passwords
            if not new_password or not confirm_password:
                return Response({'error': 'Both passwords are required'})

            if new_password != confirm_password:
                return Response({'error': 'Passwords do not match'})

            # Set new password
            user.set_password(new_password)
            user.save()

            return Response({'message': 'Password reset successful'})

        except Exception as e:
            return Response({'error': 'An error occurred'})

# """
# ███████╗██████╗ ██╗███████╗███╗   ██╗██████╗     ██████╗ ███████╗ ██████╗ ██╗   ██╗███████╗███████╗████████╗    ██████╗ ███████╗███╗   ███╗ ██████╗ ██╗   ██╗███████╗     █████╗ ██████╗ ██████╗        ██████╗ █████╗ ███╗   ██╗ ██████╗███████╗██╗      ██████╗ ███████╗     ██╗███████╗ ██████╗████████╗
# ██╔════╝██╔══██╗██║██╔════╝████╗  ██║██╔══██╗    ██╔══██╗██╔════╝██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝    ██╔══██╗██╔════╝████╗ ████║██╔═══██╗██║   ██║██╔════╝    ██╔══██╗██╔══██╗██╔══██╗      ██╔════╝██╔══██╗████╗  ██║██╔════╝██╔════╝██║      ██╔══██╗██╔════╝     ██║██╔════╝██╔════╝╚══██╔══╝
# █████╗  ██████╔╝██║█████╗  ██╔██╗ ██║██║  ██║    ██████╔╝█████╗  ██║   ██║██║   ██║█████╗  ███████╗   ██║       ██████╔╝█████╗  ██╔████╔██║██║   ██║██║   ██║█████╗█████╗███████║██║  ██║██║  ██║█████╗██║     ███████║██╔██╗ ██║██║     █████╗  ██║█████╗██████╔╝█████╗       ██║█████╗  ██║        ██║   
# ██╔══╝  ██╔══██╗██║██╔══╝  ██║╚██╗██║██║  ██║    ██╔══██╗██╔══╝  ██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║       ██╔══██╗██╔══╝  ██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██╔══╝╚════╝██╔══██║██║  ██║██║  ██║╚════╝██║     ██╔══██║██║╚██╗██║██║     ██╔══╝  ██║╚════╝██╔══██╗██╔══╝  ██   ██║██╔══╝  ██║        ██║   
# ██║     ██║  ██║██║███████╗██║ ╚████║██████╔╝    ██║  ██║███████╗╚██████╔╝╚██████╔╝███████╗███████║   ██║       ██║  ██║███████╗██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ███████╗    ██║  ██║██████╔╝██████╔╝      ╚██████╗██║  ██║██║ ╚████║╚██████╗███████╗███████╗ ██║  ██║███████╗╚█████╔╝███████╗╚██████╗   ██║   
# ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝     ╚═╝  ╚═╝╚══════╝ ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝       ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚══════╝    ╚═╝  ╚═╝╚═════╝ ╚═════╝        ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚══════╝ ╚═╝  ╚═╝╚══════╝ ╚════╝ ╚══════╝ ╚═════╝   ╚═╝   
# """

class FriendRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Include both pending and accepted requests in the list
        return FriendRequest.objects.filter(
            (models.Q(sender=self.request.user) | models.Q(receiver=self.request.user))
        ).select_related('sender', 'receiver')

    def create(self, request, *args, **kwargs):
        try:
            receiver_username = request.data.get('receiver')
            if not receiver_username:
                return Response(
                    {'detail': 'Receiver username is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                receiver = User.objects.get(username=receiver_username)
            except User.DoesNotExist:
                return Response(
                    {'detail': f'User {receiver_username} not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Check for any existing requests (both directions)
            existing_request = FriendRequest.objects.filter(
                (models.Q(sender=request.user, receiver=receiver) |
                 models.Q(sender=receiver, receiver=request.user)),
                status='pending'
            ).first()

            if existing_request:
                return Response(
                    {'status': 'Friend request already exists'},
                )

            # Check if they're already friends
            if FriendList.objects.filter(
                user=request.user,
                friends=receiver
            ).exists():
                return Response(
                    {'detail': 'Already friends'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            friend_request = FriendRequest.objects.create(
                sender=request.user,
                receiver=receiver,
                status='pending'
            )

            serializer = self.get_serializer(friend_request)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'detail': 'An error occurred while processing your request'},
                status=400
            )

class FriendRequestDetailView(generics.RetrieveAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]
    queryset = FriendRequest.objects.all()

class FriendRequestAcceptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        friend_request = get_object_or_404(FriendRequest, pk=pk)
        
        if friend_request.receiver != request.user:
            return Response(
                {'detail': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        friend_request.status = FriendRequest.ACCEPTED
        friend_request.save()

        # Add to friend lists
        sender_friend_list, _ = FriendList.objects.get_or_create(user=friend_request.sender)
        receiver_friend_list, _ = FriendList.objects.get_or_create(user=friend_request.receiver)
        
        sender_friend_list.friends.add(friend_request.receiver)
        receiver_friend_list.friends.add(friend_request.sender)

        return Response({'status': 'friend request accepted'})

class FriendRequestRejectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        friend_request = get_object_or_404(FriendRequest, pk=pk)
        if friend_request.receiver != request.user:
            return Response(
                {'detail': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        friend_request.delete()
        return Response({'status': 'friend request rejected'})

class FriendRequestCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        friend_request = get_object_or_404(FriendRequest, pk=pk)
        if friend_request.sender != request.user:
            return Response(
                {'detail': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        friend_request.delete()
        return Response({'status': 'friend request cancelled'})

class FriendListView(generics.ListAPIView):
    serializer_class = FriendListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FriendList.objects.filter(user=self.request.user)

class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        friend_request = get_object_or_404(FriendRequest)
        friend = get_object_or_404(User, username=request.data.get('username'))
        friend_list = get_object_or_404(FriendList, user=request.user)
        friend_list.friends.remove(friend)
        
        # Remove from friend's list as well
        friend_friend_list = get_object_or_404(FriendList, user=friend)
        friend_friend_list.friends.remove(request.user)
        friend_request.delete()
        
        return Response({'status': 'friend removed'})

# """
# ███████╗ █████╗ ██╗  ██╗██╗███╗   ██╗ ██████╗     ██████╗ ███████╗ █████╗ ██╗  ████████╗██╗███╗   ███╗███████╗     ██████╗ ███╗   ██╗██╗     ██╗███╗   ██╗███████╗    ███████╗████████╗ █████╗ ████████╗██╗   ██╗███████╗
# ██╔════╝██╔══██╗██║ ██╔╝██║████╗  ██║██╔════╝     ██╔══██╗██╔════╝██╔══██╗██║  ╚══██╔══╝██║████╗ ████║██╔════╝    ██╔═══██╗████╗  ██║██║     ██║████╗  ██║██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██║   ██║██╔════╝
# █████╗  ███████║█████╔╝ ██║██╔██╗ ██║██║  ███╗    ██████╔╝█████╗  ███████║██║     ██║   ██║██╔████╔██║█████╗      ██║   ██║██╔██╗ ██║██║     ██║██╔██╗ ██║█████╗      ███████╗   ██║   ███████║   ██║   ██║   ██║███████╗
# ██╔══╝  ██╔══██║██╔═██╗ ██║██║╚██╗██║██║   ██║    ██╔══██╗██╔══╝  ██╔══██║██║     ██║   ██║██║╚██╔╝██║██╔══╝      ██║   ██║██║╚██╗██║██║     ██║██║╚██╗██║██╔══╝      ╚════██║   ██║   ██╔══██║   ██║   ██║   ██║╚════██║
# ██║     ██║  ██║██║  ██╗██║██║ ╚████║╚██████╔╝    ██║  ██║███████╗██║  ██║███████╗██║   ██║██║ ╚═╝ ██║███████╗    ╚██████╔╝██║ ╚████║███████╗██║██║ ╚████║███████╗    ███████║   ██║   ██║  ██║   ██║   ╚██████╔╝███████║
# ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝     ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚══════╝
# """
    
#Faking Realtime Online status
class UserOnlineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.is_online = True
            request.user.save(update_fields=['is_online'])
            return Response({'status': 'online'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class UserOfflineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.is_online = False
            request.user.save(update_fields=['is_online'])
            return Response({'status': 'offline'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)