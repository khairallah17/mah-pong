"""
URL configuration for Game project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from Match.views import TournamentList, PlayerMatchHistory, PlayerStats

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/tournaments', TournamentList.as_view(), name='tournament-list'),
    path('api/match-history/<str:username>/', PlayerMatchHistory.as_view(), name='player-match-history'),
    path('api/match-history/', PlayerMatchHistory.as_view(), name='current-player-match-history'),
    path('api/player-stats/<str:username>/', PlayerStats.as_view(), name='player-stats'),
]

