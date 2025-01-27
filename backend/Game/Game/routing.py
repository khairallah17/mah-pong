from channels.routing import ProtocolTypeRouter, URLRouter # type: ignore
from django.urls import path # type: ignore
from . import consumers
from . import consumers2

websocket_urlpatterns = [
	path('ws/matchmaking/', consumers2.MatchmakingConsumer.as_asgi()),
    path('ws/tournament/', consumers.TournamentConsumer.as_asgi()),
    path('ws/tictactoe/', consumers.TictactoeConsumer.as_asgi()),
    path('ws/pvp2d/', consumers.Pvp2dConsumer.as_asgi()),
    # path('ws/notifications/', consumers.notificationsConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns)
})