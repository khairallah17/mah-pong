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
    def post(self, request, *args, **keyword):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, email=email, password=password)
        if user is None:
            output = f"This user are not on database{request.user}"
            return Response({'response' : output}, status=status.HTTP_200_OK) #we should to return another HTTP request not 200 OK request
    def get(self, request):
        output = f"Welcome {request.user}, Request Accepted You can Login Now"
        return Response({'response' : output}, status=status.HTTP_202_ACCEPTED)
    
class RegisterationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerial
    def get(self, request):
        output = f"Welcome {request.user}, Request Accepted You can Register Now"
        return Response({'response' : output}, status=status.HTTP_202_ACCEPTED)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated]) # thats mean no one can pass to here util they authenticated 
def protectedview(requst):
    output = f"Welcome {requst.user}, Auth Succ"
    return Response({'response' : output}, status=status.HTTP_200_OK)

@api_view(['GET'])

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

#att rah yalah 7yetha hhhhhhh lkhod3a