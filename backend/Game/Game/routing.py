from channels.routing import ProtocolTypeRouter, URLRouter # type: ignore
from django.urls import path
from . import consumers  # replace with the actual location of your consumers

websocket_urlpatterns = [
    # route websocket connections to your game consumer
	path('ws/matchmaking/', consumers.MatchmakingConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns)
})