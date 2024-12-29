from django.shortcuts import redirect, get_object_or_404
from django.db import models
from django.db.models import Q
from django.http import HttpResponse, HttpResponseRedirect
from .models import User, TwoFactorAuthAttempt
from .serializers import Get_Token_serial, RegistrationSerial, UserSerial, LogoutSerial
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
from django.contrib.auth.hashers import check_password


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
        try:
            user = User.objects.get(
                email=User.objects.get(email=email),
                username=username
            )
            # return Response({
            #     'user ': UserSerial(user).data,
            #     'access_token ' : token_JSON["access_token"],
            #     'refresh_token ' : token_JSON.get('refresh_token')
            # })
            # print ("ff")
        except User.DoesNotExist:
            user = User.objects.create(
                fullname=getInfo.json()['name'],
                username=username,
                email=email,
                img="./" + username + ".jpg"
            )
            user.save()
            # return Response({
            #     'user ': UserSerial(user).data,
            #     'access_token ' : token_JSON["access_token"],
            #     'refresh_token ' : token_JSON["refresh_token"]
            # })
            # Get_Token_serial()
        #create Token for This user using JWT "we use RefreshToken because it automaticly create both refresh_token and access_token"
        #we didn't use AccessToken because it automaticly create just access_token"
        # acces_token = Get_Token_serial.get_token(user)
        refresh = Get_Token_serial.get_token(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        response = redirect(f"http://localhost:5173/google-callback?access_token={access_token}")
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
        
        try:
            user = User.objects.get(
                email=User.objects.get(email=email),
                username=username
            )
        except User.DoesNotExist:
            user = User.objects.create(
                fullname=getInfoUser.json().get('displayname'),
                username=username,
                email=email,
                img="./" + username + ".jpg"
            )
            user.save()

        # now sending access token to Front
                # Generate tokens
        refresh = Get_Token_serial.get_token(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = redirect(f"http://localhost:5173/42intra-callback?access_token={access_token}")

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


    
class UserInfoApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerial(request.user)
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


#sending Profil info if exemple https://localhost:5173/profil/<username>
# class Profil(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):