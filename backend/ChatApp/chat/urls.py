from django.urls import path
from .views import get_users, get_conversation, test

urlpatterns = [
    path('api/users/', get_users, name='get-users'),
    path('api/conversation/<int:user_id>', get_conversation, name='get-conversation'),
    path('api/test/', test, name="test")
]