from dotenv import load_dotenv
import os

# Load evnironment variables from the production.env file in the working directory
load_dotenv()


def _parse_boolean(name: str) -> bool:
    raw_value = os.getenv(name)

    if not raw_value:
        return False

    parsed_value = True
    if raw_value == "false" or raw_value == "0":
        parsed_value = False

    return parsed_value


class Database:
    NAME = os.getenv("DJANGO_POSTGRES_DATABASE") or "spritstat"
    USER = os.getenv("DJANGO_POSTGRES_USER") or "spritstat"
    PASSWORD = os.getenv("DJANGO_POSTGRES_PASSWORD")
    HOST = os.getenv("DJANGO_POSTGRES_HOST") or "localhost"
    PORT = os.getenv("DJANGO_POSTGRES_PORT") or 5432


class Email:
    BACKEND = (
        os.getenv("DJANGO_EMAIL_BACKEND")
        or "django.core.mail.backends.console.EmailBackend"
    )
    HOST = os.getenv("DJANGO_EMAIL_HOST") or "localhost"
    PORT = os.getenv("DJANGO_EMAIL_PORT") or "25"
    USERNAME = os.getenv("DJANGO_EMAIL_USERNAME")
    PASSWORD = os.getenv("DJANGO_EMAIL_PASSWORD")
    DEFAULT_FROM_EMAIL = os.getenv("DJANGO_DEFAULT_FROM_EMAIL") or "webmaster@localhost"
    SERVER_EMAIL = os.getenv("DJANGO_SERVER_EMAIL") or "root@localhost"


class Settings:
    DEBUG = _parse_boolean("DJANGO_DEBUG")
    LOG_LEVEL = (
        os.getenv("DJANGO_LOG_LEVEL").upper()
        if os.getenv("DJANGO_LOG_LEVEL")
        else "INFO"
    )
    STATIC_ROOT = os.getenv("DJANGO_STATIC_ROOT") or None
    ALLOWED_HOSTS = (
        ["localhost", "127.0.0.1"]
        if not os.getenv("DJANGO_ALLOWED_HOSTS")
        else os.getenv("DJANGO_ALLOWED_HOSTS").split(",")
    )
    SECRET_KEY = os.getenv("DJANGO_SECRET")
    SECURE_COOKIE = _parse_boolean("DJANGO_SECURE_COOKIE")
    DOMAIN = os.getenv("DJANGO_DOMAIN") or "localhost"
