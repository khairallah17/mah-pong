from django.urls import path
from . import views

urlpatterns = [
    # path('api/users/', get_users, name='get-users'),
    # path('api/users/', views.user_list, name='user-list'),
    path('api/users/', views.ApiUsers.as_view(), name='user-list'),
    path('api/conversation/<int:id>/', views.get_conversation, name='get-conversation'),
    # path('api/test/', views.test, name="test"),
    # path('api/send-message/', views.send_message, name='send-message'),
]