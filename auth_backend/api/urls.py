from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('token/', views.Get_MyTokenObtainPairView.as_view(), name="signin"),
    path('token/refresh/', TokenRefreshView.as_view(), name="refresh-token"),
    path('register/', views.RegisterationView.as_view(), name="signup"),
    # path('test/', views.protectedview, name="test"),
    # path('', views.viewallrouting, name="all-routes")
]