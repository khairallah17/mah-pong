from django.shortcuts import render
from .models import User
from .serializers import Get_Token_serial, RegistrationSerial
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
# Create your views here.


class Get_MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = Get_Token_serial
    
class RegisterationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerial
    
@api_view(['GET'])
@permission_classes([IsAuthenticated]) # thats mean no one can pass to here util they authenticated 
def protectedview(requst):
    output = f"Welcome {requst.user}, Auth Succ"
    return Response({'response' : output}, status=status.HTTP_200_OK)

@api_view(['GET'])

def viewallrouting(request):
    data = [
        'API/token/refresh',
        'API/register/',
        'API/token/'
    ]
    
    return Response(data)