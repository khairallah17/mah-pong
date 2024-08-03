from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView

class MyView(APIView):
    def get(self, request):
        data = {"key" : "value"}  # Replace with your actual data
        return Response(data)