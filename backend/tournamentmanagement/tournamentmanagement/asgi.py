"""
ASGI config for tournamentmanagement project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tournamentmanagement.settings')

application = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from tournament.routing import websocket_urlpatterns as tournament_websockets

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter(
            tournament_websockets
        )
    ),
})
