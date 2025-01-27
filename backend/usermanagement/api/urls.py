from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
# from .views import GoogleLogin, GoogleLoginCallback
# from . import adapter

urlpatterns = [
    
    #zouhair urls Path
    path('allusers/', views.get_allusers.as_view(), name="all-users"),
    path('edit-profile/', views.UserEditProfileView.as_view(), name='user-edit-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    
    path('token/', views.Get_MyTokenObtainPairView.as_view(), name="signin"),
    path('user-profile/<str:username>/', views.UserProfileApi.as_view(), name="user-profile"),
    path('token/refresh/', TokenRefreshView.as_view(), name="refresh-token"),
    path('register/', views.RegisterationView.as_view(), name="signup"),
    path('logout/', views.LogoutViews.as_view(), name="logout"),
    path('', views.viewallrouting, name="all-routes"),
    path('v2/auth/googlelogin/', views.GoogleLoginView, name='google_login'),
    path('v2/auth/googlelogin/callback/', views.GoogleLoginCallback.as_view(), name='gcall_back_login'),
    path('42login/callback/', views.Login42Auth.as_view(), name='42call_back_login'),
    path('api-set-password/', views.SetPasswordForApi.as_view(), name='api_se_password'),
    path('password-reset/', views.send_resetpass, name='password-reset-request'),
    path('password-reset/<str:uidb64>/<str:token>/', views.Confirm_reset_Password.as_view(), name='password-reset-confirm'),
    path('2fa/setup/', views.TwoFactorAuthenticationView.as_view(), name='2fa-setup'),
    path('2fa/verify/', views.Verify2FAView.as_view(), name='2fa-verify'),
    path('2fa/disable/', views.Disable2FAView.as_view(), name='2fa-disable'),
    path('2fa/check/', views.Check2FAStatusView.as_view(), name='2fa-check'),
    path('friend-requests/', views.FriendRequestListCreateView.as_view(), name='friend-request-list'),
    path('friend-requests/<uuid:pk>/', views.FriendRequestDetailView.as_view(), name='friend-request-detail'),
    path('friend-requests/<uuid:pk>/accept/', views.FriendRequestAcceptView.as_view(), name='friend-request-accept'),
    path('friend-requests/<uuid:pk>/reject/', views.FriendRequestRejectView.as_view(), name='friend-request-reject'),
    path('friend-requests/<uuid:pk>/cancel/', views.FriendRequestCancelView.as_view(), name='friend-request-cancel'),
    path('friends/', views.FriendListView.as_view(), name='friend-list'),
    path('friends/remove/', views.RemoveFriendView.as_view(), name='friend-remove'),
    path('user-online/', views.UserOnlineView.as_view(), name='user-online'),
    path('user-offline/', views.UserOfflineView.as_view(), name='user-offline'),

]
