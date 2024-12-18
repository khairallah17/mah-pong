from channels.routing import ProtocolTypeRouter, URLRouter # type: ignore
from django.urls import path
from . import consumers

websocket_urlpatterns = [
	path('ws/matchmaking/', consumers.MatchmakingConsumer.as_asgi()),
    path('ws/tournament/', consumers.TournamentConsumer.as_asgi()),
    path('ws/notifications/', consumers.NotificationsConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns)
})