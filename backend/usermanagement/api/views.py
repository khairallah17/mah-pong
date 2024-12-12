from django.shortcuts import redirect
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from .models import User
from .serializers import Get_Token_serial, RegistrationSerial, UserSerial, LogoutSerial, UserSearchSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
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

from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


CLIENT_ID = os.environ.get('CLIENT_ID')
CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
GCLIENT_ID = os.environ.get('GCLIENT_ID')
GCLIENT_SECRET = os.environ.get('GCLIENT_SECRET')

print (CLIENT_ID)
print (CLIENT_SECRET)
print (GCLIENT_ID)
print (GCLIENT_SECRET)

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Your search logic here
        term = request.query_params.get('term', '')
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))
        # Example response
        return Response({"users": [], "totalPages": 0, "total": 0})

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
        
        # here if the user are authenticate sper() call the parent class post method to generate new token
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
        # here we set the token to the http only cookies to be used in the frontend for more security
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
            "client_id"     : GCLIENT_ID, # check .env file
            "client_secret" : GCLIENT_SECRET, # check .env file
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
        acces_token = Get_Token_serial.get_token(user)
        # acces_token = token['access_token']
        # print (acces_token)
        return redirect(f"http://localhost:5173/google-callback?access_token={acces_token}")


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
            print("here1")
            # if email in User:
            user = User.objects.get(
                # print("here11"),
                fullname = getInfoUser.json().get('displayname'),
                username = username,
                email=User.objects.get(email=email)
            )
            print("here12")
        except User.DoesNotExist:
            print("here112")
            user = User.objects.create(
                fullname = getInfoUser.json().get('displayname'),
                username = username,
                email = email,
                img = "./" + username + ".jpg"
            )
            user.save()
        # now sending access token to Front
        send_token = Get_Token_serial.get_token(user)
        # print ("sdsdsd")
        # return Response({
        #     'user' : UserSerial(user).data,
        #     'access_token' : token_json.get('access_token')
        # })
        return redirect(f"http://localhost:5173/42intra-callback?access_token={send_token}")



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
            return JsonResponse({'error': 'An error occurred'}, status=500)

    def options(self, request, *args, **kwargs):
        response = JsonResponse({}, status=200)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-Requested-With"
        return response

# @api_view(['POST']) # this specifies that only POST method is allowed

# def send_resetpass(request):
#     email = request.data.get('email')
#     print(email)
#     if User.objects.filter(email=email).exists():
#         user = User.objects.get(email=email)
#         uidb64 = urlsafe_base64_encode(force_bytes(str(user.id)))
#         gen_token = account_activation_token.make_token(user)
#         reset_url = f"http://localhost:8001/api/password-reset/{uidb64}/{gen_token}"
        
#         subject = 'Password Reset Request'
#         message = f"""
#         Hello,

#         You have requested to reset your password. Please click the link below:

#         {reset_url}

#         If you did not request this reset, please ignore this email.

#         Thanks,
#         Your App Team
#         """
#         print (reset_url)
#         send_mail(
#             subject,
#             message,
#             settings.EMAIL_HOST_USER,
#             [email],
#             fail_silently=False,
#         )
#         print (" hhhhhhhhhhh ")
#         # email_message.send(fail_silently=False)
#         return Response({'message': 'Password reset email has been sent.'})
#     return Response({'error': 'Email not found'}, status=400)


# @api_view(['POST'])
# def reset_password(request, uidb64, token):
#     try:
#         # Decode the user ID
#         uid = force_str(urlsafe_base64_decode(uidb64))
#         user = User.objects.get(id=uid)
#         if not account_activation_token.check_token(user, token):
#             return Response(
#                 {'error': 'Invalid or expired reset link'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         new_password = request.data.get('new_password')
#         confirm_password = request.data.get('confirm_password')
#         #checking the password are 3amra or not a am3lem
#         if not new_password or not confirm_password:
#             return Response(
#                {'error': 'Both password fields are required'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         # chacking now wash passwords are identical
#         if new_password != confirm_password:
#             return Response(
#                 {'error': 'Passwords do not match'}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             validate_password(new_password, user)
#         except ValidationError as e:
#             return Response(
#                 {'error': "Password Requirement are not valid"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
            
#         user.set_password(new_password)
#         user.save()
        
#         return Response({
#             'message': 'Password has been reset successfully.'
#         }, status=status.HTTP_200_OK)
        
#     except (TypeError, ValueError, User.DoesNotExist):
#         return Response(
#             {'error': 'Invalid reset link'}, 
#             status=status.HTTP_400_BAD_REQUEST
#         )

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
        'api/token/refresh',
        'api/register',
        'api/token',
        'api/logout',
        'api/password-reset'
        # 'api/googlelogin/callback/'
        # 'admin/token/refresh',
        # 'admin/register/',
        # 'admin/token/'
    ]
    return Response(data)


