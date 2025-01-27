from django.urls import path
from . import views

urlpatterns = [
    # path('api/users/', get_users, name='get-users'),
    # path('api/users/', views.user_list, name='user-list'),
    path('api/users/', views.ApiUsers.as_view(), name='user-list'),
    path('api/test/', views.test.as_view(), name='user-list'),
    path('api/conversation/<str:id>/', views.get_conversation, name='get-conversation'),
    path('api/block-status/<str:user_id>/', views.get_block_status, name='get-block-status'),
    path('api/block_user/<str:user_id>/', views.block_user, name='block_user'),
    # path('api/test/', views.test, name="test"),
    # path('api/send-message/', views.send_message, name='send-message'),
]