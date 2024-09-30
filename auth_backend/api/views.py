from django.shortcuts import render
from .models import User
from .serializers import Get_Token_serial, RegistrationSerial
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.contrib.auth import authenticate
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
                status=status.HTTP_200_OK
            )
        
        # here if the user are authenticate sper() call the parent class post method to generate new token
        return super().post(request) 
    
    def get(self, request):
        if not request.user.is_authenticated: #checking if the user are not authenticate before 
            return Response(
                {"error": "User is not authenticated"},
                status=status.HTTP_202_ACCEPTED
            ) #returning HTTP request if the user are not existed
        
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
    
class RegisterationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerial
    
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Here i called the create method in serializer, to create requirments user fieled
        user = serializer.save()
        headers = self.get_success_headers(serializer.data) #
        return Response(
            {
                "message": "User Registered Successfully",
                "User": serializer.data
            }, status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            return Response(
                {
                    "message": "User is already authenticated",
                    "username": user.username,
                    "email": user.email,
                    # "fullname": user.fullname,  # Uncomment if fullname is available
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"message": "User is not authenticated"},
                status=status.HTTP_401_UNAUTHORIZED
            )

@api_view(['GET'])
@permission_classes([IsAuthenticated]) # thats mean no one can pass to here util they authenticated 
# def protectedview(request):
#     output = f"Welcome {request.user}, Auth Succ"
#     return Response({'response' : output}, status=status.HTTP_200_OK)

# @api_view(['GET'])

def viewallrouting(request):
    data = [
        'api/token/refresh',
        'api/register',
        'api/token',
        # 'admin/token/refresh',
        # 'admin/register/',
        # 'admin/token/'
    ]
    return Response(data)

