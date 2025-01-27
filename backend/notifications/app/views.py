from django.shortcuts import render
from .models import Notification
from .serializers import NotificationSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

# ███╗   ██╗ ██████╗ ████████╗██╗███████╗██╗ ██████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗    ██╗     ██╗███████╗████████╗
# ████╗  ██║██╔═══██╗╚══██╔══╝██║██╔════╝██║██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║    ██║     ██║██╔════╝╚══██╔══╝
# ██╔██╗ ██║██║   ██║   ██║   ██║█████╗  ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║    ██║     ██║███████╗   ██║   
# ██║╚██╗██║██║   ██║   ██║   ██║██╔══╝  ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║    ██║     ██║╚════██║   ██║   
# ██║ ╚████║╚██████╔╝   ██║   ██║██║     ██║╚██████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║    ███████╗██║███████║   ██║   
# ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚═╝╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ╚══════╝╚═╝╚══════╝   ╚═╝   

class NotificationList(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.kwargs['user']
        return Notification.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.kwargs['user']
        serializer.save(user=user)