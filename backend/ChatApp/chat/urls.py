from django.urls import path
from .views import get_users, get_conversation

urlpatterns = [
    path('api/users/', get_users, name='get-users'),
    path('api/conversation/<int:user_id>', get_conversation, name='get-conversation'),
]