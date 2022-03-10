from django.contrib.sessions.management.commands.clearsessions import (
    Command as ClearSessionCommand,
)

from .notification import send_location_notification, Token
from .price import request_location_prices


def clear_expired_sessions():
    # Clear database backed sessions using the clearsessions command
    ClearSessionCommand().handle()
