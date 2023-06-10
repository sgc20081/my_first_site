import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.security.websocket import AllowedHostsOriginValidator
import catalog.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "my_first_site.settings")

application = ProtocolTypeRouter({
  "http": get_asgi_application(),
  "websocket": AllowedHostsOriginValidator(
    AuthMiddlewareStack(
            URLRouter(
                catalog.routing.websocket_urlpatterns
            )
        ),
  )
})