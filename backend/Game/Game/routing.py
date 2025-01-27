from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from . import consumers
from . import consumers2

websocket_urlpatterns = [
	path('ws/matchmaking/', consumers2.MatchmakingConsumer.as_asgi()),
    path('ws/tournament/', consumers.TournamentConsumer.as_asgi()),
    path('ws/tictactoe/', consumers.TictactoeConsumer.as_asgi()),
    path('ws/pvp2d/', consumers.Pvp2dConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns)
})