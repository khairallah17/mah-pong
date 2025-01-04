from django.shortcuts import redirect, get_object_or_404
from django.db import models
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from .models import User, TwoFactorAuthAttempt
from .serializers import Get_Token_serial, RegistrationSerial, UserSerial, LogoutSerial, UserProfileSerializer
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
from django.utils import timezone
from .models import FriendRequest, UserOnlineStatus
from rest_framework.decorators import action
from django.db.models import Q


CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
GCLIENT_ID = os.environ.get('GCLIENT_ID')
GCLIENT_SECRET = os.environ.get('GCLIENT_SECRET')

print (CLIENT_ID)
print (CLIENT_SECRET)
print (GCLIENT_ID)
print (GCLIENT_SECRET)

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
    #rechecking for user on Post fuction if the user are not in database also impliment get function to catch http request and sending access token and refresh token
    # def post(self, request):
    #     email = request.data.get('email')
    #     password = request.data.get('password')
    #     user = authenticate(request, email=email, password=password)
    #     if user is None:
    #         output = f"This user are not on database{request.user}"
    #         return Response({'response' : output}, status=status.HTTP_200_OK) #we should to return another HTTP request not 200 OK request
    # def get(self, request):
    #     output = f"Welcome {request.user}, Request Accepted You can Login Now"
    #     return Response({'response' : output}, status=status.HTTP_202_ACCEPTED)
    
# User = get_user_model()

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
        # user = request.user
        # if user.is_authenticated: # no needed we already check for unique username
        #     return Response(
        #         {
        #             "message": "User is already authenticated",
        #             "username": user.username,
        #             "email": user.email,
        #             # "fullname": user.fullname,  # Uncomment if fullname is available
        #         },
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        # else:
        return Response(
            {"message": "User is not authenticated"},
            status=status.HTTP_202_ACCEPTED
        )

# class GoogleLogin(SocialLoginView):
#     # adapter_class = GoogleOAuth2Adapter
#     callback_url = "http://localhost:3000/"
#     # client_class = OAuth2Client
#     def get(self, request):
#         print ("sdjaskdjalskdjaskldjaskldjaksldjaskldjaklsdjaksldjaklsdjaksld")
#         code = request.args.get("code")
#         print (code)
#         return ("Hello User DONE!")

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # thats mean no one can pass to here util they authenticated 

# Creating Views For Google Login/Signup User using dj-rest-auth's Package

class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173/"
    client_class = OAuth2Client
    
def generate_temp_password(length=12):
    """Generate a secure temporary password"""
    characters = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(random.choice(characters) for i in range(length))

# Creating Google login CallBack views
class GoogleLoginCallback(APIView):
    def get(self, request):
        # user = super().get(request)
        code = request.GET.get("code")
        if code is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        print("code are: ", code)
        token_url  = "https://oauth2.googleapis.com/token"
        token_data = {
            "code"          : code,
            "client_id"     : GCLIENT_ID,
            "client_secret" : GCLIENT_SECRET,
            "redirect_uri"  : "http://localhost:8001/api/v2/auth/googlelogin/callback/",
            "grant_type"    : "authorization_code"
        }
        token_response = requests.post(token_url, data = token_data)
        token_JSON = token_response.json()
        # if not ('access_token')
        getInfo = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", params = {'access_token': token_JSON["access_token"]}) # Getting Token To Extraction User Data
        print (token_JSON)
        email = getInfo.json()["email"]
        username = getInfo.json()['email'].split('@')[0]
        #telechargit imaghe dyal google
        urllib.request.urlretrieve(getInfo.json()['picture'], "./media/" + username + ".jpg")
        # Here i want to getting info from database or create if dosent exist

        # Generating Random Password
        tmp_password = generate_temp_password()

        try:
            user = User.objects.get(email=email)
            if not user.password:
                user.password = make_password(tmp_password)
                user.save()
                is_password_need = True
            else:
                is_password_need = False
        except User.DoesNotExist:
            user = User.objects.create(
                fullname=getInfo.json()['name'],
                username=username,
                email=email,
                password=make_password(tmp_password),
                img="./" + username + ".jpg"
            )
            is_password_need = True
            user.save()
        
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
        # return redirect(f"http://localhost:5173/google-callback?access_token={acces_token}")


class Login42Auth(APIView):
    def get(self, request):
        code = request.GET.get('code')
        if code is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        # Sending request to 42 API to Get Token
        get_Token_url = "https://api.intra.42.fr/oauth/token"
        # this is Requarments data should to get Token from 42 API
        Token_data = {
            'code'          : code,
            "client_id"     : CLIENT_ID,
            "client_secret" : CLIENT_SECRET,
            "redirect_uri"  : "http://localhost:8001/api/42login/callback/",
            "grant_type"    : "authorization_code"
        }
        # Sendding Now Request to 42 API to getting return the Access_Token
        request_token = requests.post(get_Token_url, data = Token_data)
        token_json = request_token.json()
        # print (token_json)
        # extracting information From Token Now Hnaya
        getInfoUser = requests.get("https://api.intra.42.fr/v2/me", headers={'Authorization': f'Bearer {token_json["access_token"]}'})
        # print("heeeere", getInfoUser.json().get('email'))
        username = getInfoUser.json().get('login')
        email = getInfoUser.json().get('email')
        
        #telechargit imaghe dyal intra
        urllib.request.urlretrieve(getInfoUser.json().get('image')['link'], "./media/" + username + ".jpg")
        

        # Creating Random Password for user logged using 42API
        tmp_password = generate_temp_password()
        try:
            user = User.objects.get(email=email)
            if not user.password:
                user.password = make_password(tmp_password)
                user.save()
                is_password_need = True
            else:
                is_password_need = False
        except User.DoesNotExist:
            user = User.objects.create(
                fullname=getInfoUser.json().get('displayname'),
                username=username,
                password=make_password(tmp_password),
                email=email,
                img="./" + username + ".jpg"
            )
            # user.save()
            is_password_need = True

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
        
        if tmp_password and not user.check_password(tmp_password): #checking if the tmp_password are setted to user before entring new password
            return Response(
                {'error': 'Temporary Password are Invalid'},
                status=400
            )
        user.password = make_password(new_password)
        user.save()
        return Response({'message': 'Password set successfully'})


# class   Send_Reset_Password(View):
@api_view(['POST'])
def send_resetpass(request): #sending email 
    email = request.data.get('email')
    print(email)
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        uidb64 = urlsafe_base64_encode(force_bytes(str(user.id)))
        gen_token = account_activation_token.make_token(user)
        reset_url = f"http://localhost:8001/api/password-reset/{uidb64}/{gen_token}/"
        
        subject = 'Password Reset Request'
        message = f"""
        Hello,

        You have requested to reset your password. Please click the link below:

        {reset_url}

        If you did not request this reset, please ignore this email.

        Thanks,
        Your App Team
        """
        print (reset_url)
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        print (" hhhhhhhhhhh ")
        # email_message.send(fail_silently=False)
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
            # Add debug logging
            print(f"Received uidb64: {uidb64}")
            print(f"Received token: {token}")
            print(f"Request body: {request.body}")

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
            print(f"Error: {str(e)}")
            return JsonResponse({'error': 'An error occurred'}, status=400)

    def options(self, request, *args, **kwargs):
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
        return response

class LogoutViews(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print ("ahyya Hanyaa1")
        try:
            refresh_token = request.data.get('refresh')
            print ("not here 1")
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            print ("ahyya Hanyaa2")
            token = RefreshToken(refresh_token)
            print ("ahyya Hanyaa23")
            token.blacklist()
            print ("ahyya Hanyaa24")

            return Response(
                {'message': 'Successfully logged out'}, 
                status=status.HTTP_200_OK
            )
        except TokenError as e:
            print ("ahyya Hanyaa12")
            return Response(
                {'error': 'Invalid token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileApi(APIView):
    def get(self, request, username):
        try:
            # logger.info(f"Getting profile data for {username}")
            user = get_object_or_404(User, username=username)
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)
        except Exception as e:
            # logger.error(f"Error getting profile for {username}: {str(e)}")
            return Response({"error": str(e)}, status=400)

# Make Comminication Between Game App and Usermanagment App using API
class UserInfoApi(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            logger.info(f"Getting user data for {username}")
            user = User.objects.get(username=username)
            serializer = UserSerial(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            logger.error(f"User {username} does not exist")
            return Response({"error": "User does not exist"}, status=404)
    
    def patch(self, request, username):
        try:
            logger.info(f"Updating user data for {username}")
            user = User.objects.get(username=username)
            #allowed Fields to update from Game App
            game_fields = {
                'nblose',
                'nbwin', 
                'score',
            }

            data = {}

            for key, value in request.data.items():
                if key in game_fields:
                    if key in ['nblose', 'nbwin']:
                        current_value = getattr(user, key, 0)
                        data[key] = current_value + value
                    else:
                        data[key] = value
            serializer = UserSerial(request.user, data=data, partial=True) # partial=True kay3ni update just what field allowed  "game_fields = {'nblose','nbwin', 'score'}" 
            # if partial=False it will always update all fieled in UserSerial all those "fields = ['id', 'username', 'email', 'fullname', 'nblose', 'nbwin', 'score', 'img', 'avatar', 'two_factor_enabled', 'last_login_2fa']" every time

            if serializer.is_valid():
                serializer.save()
                logger.info(f"User data updated for {username}")
                return Response(serializer.data)
            logger.error(f"Error updating user data for {username}")
            return Response(serializer.errors, status=400)
        except Exception as e:
            logger.error(f"Error updating user data for {username}")
            return Response({"error": "Somthing Wrong in updating data"}, status=400)


def viewallrouting(request):
    data = [
        'api/'
        'api/token/refresh',
        'api/register',
        'api/token',
        'api/logout',
        'api/password-reset'
        # 'api/googlelogin/callback/'
        # 'admin/token/refresh',
        # 'admin/register/',
        # 'admin/token/'APIView
    ]
    return Response(data)

class get_allusers(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        
        users = User.objects.all()
        print (users)
        serializer = UserSerial(users, many=True)
        return Response(serializer.data)


class UserEditProfileView(APIView):
    """
    API View to handle user profile retrieval and updates
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve current user's profile information
        """
        serializer = UserSerial(request.user)
        return Response(serializer.data)

    def put(self, request):
        """
        Update user profile information
        """
        serializer = UserSerial(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request):
        """
        Delete user's profile image
        """
        user = request.user
        
        # Check if user has a profile image
        if not user.img:
            return Response(
                {"detail": "No profile image to delete"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Get the file path
        image_path = user.img.path

        try:
            # Delete the file from storage
            if os.path.exists(image_path):
                os.remove(image_path)
            
            # Clear the img field
            user.profile_image = None
            user.save()
            
            return Response(
                {"detail": "Profile image deleted successfully"},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"detail": f"Error deleting profile image: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR #replace this with another error like bad requeste
            )
    

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
        print(f"Authenticated user: {user.email}")
        
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
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                return Response({'error': 'Error validating password'}, status=500)

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
            print(f"Error: {str(e)}")
            return Response({'error': 'An error occurred'})


class FriendManagementView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        """Get user's friends list and their online status"""
        user = request.user
        friends = user.friends.all()
        serializer = UserSerial(friends, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        """Send friend request"""
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {"error": "User ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            to_user = User.objects.get(id=user_id)
            
            if request.user == to_user:
                return Response(
                    {"error": "You cannot send friend request to yourself"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if request.user.is_friend(to_user):
                return Response(
                    {"error": "Already friends"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if request already exists
            if FriendRequest.objects.filter(
                Q(sender=request.user, receiver=to_user) | 
                Q(sender=to_user, receiver=request.user),
                status='pending'
            ).exists():
                return Response(
                    {"error": "Friend request already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            FriendRequest.objects.create(
                sender=request.user,
                receiver=to_user,
                status='pending'
            )

            return Response({"message": "Friend request sent successfully"})

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        """Get all pending friend requests"""
        pending_requests = FriendRequest.objects.filter(
            Q(receiver=request.user, status='pending') |
            Q(sender=request.user, status='pending')
        )
        serializer = FriendRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Accept or decline friend request"""
        request_id = request.data.get('request_id')
        action = request.data.get('action')

        if not request_id or not action:
            return Response(
                {"error": "Request ID and action are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            friend_request = FriendRequest.objects.get(
                id=request_id,
                receiver=request.user,
                status='pending'
            )

            if action == 'accept':
                friend_request.accept()
                return Response({"message": "Friend request accepted"})
            elif action == 'decline':
                friend_request.decline()
                return Response({"message": "Friend request declined"})
            else:
                return Response(
                    {"error": "Invalid action"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except FriendRequest.DoesNotExist:
            return Response(
                {"error": "Friend request not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class UserOnlineStatusView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        """Update user's online status"""
        try:
            status_obj, created = UserOnlineStatus.objects.get_or_create(
                user=request.user
            )
            status_obj.is_online = True
            status_obj.last_activity = timezone.now()
            status_obj.save()
            return Response({"message": "Online status updated"})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request):
        """Set user as offline"""
        try:
            status_obj = UserOnlineStatus.objects.get(user=request.user)
            status_obj.is_online = False
            status_obj.save()
            return Response({"message": "User set to offline"})
        except UserOnlineStatus.DoesNotExist:
            return Response(
                {"error": "Status not found"},
                status=status.HTTP_404_NOT_FOUND
            )


#sending Profil info if exemple https://localhost:5173/profil/<username>
# class Profil(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):

