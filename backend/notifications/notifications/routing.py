from channels.routing import ProtocolTypeRouter, URLRouter # type: ignore
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/notifications/', consumers.notificationsConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns)
})