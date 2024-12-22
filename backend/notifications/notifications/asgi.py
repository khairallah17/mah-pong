"""
ASGI config for notifications project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter # type: ignore
from channels.sessions import SessionMiddlewareStack # type: ignore
from notifications.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notifications.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": SessionMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
