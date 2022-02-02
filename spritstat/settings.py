import os
from pathlib import Path

from .environment import Database, Email, Settings


# General settings
BASE_DIR = Path(__file__).resolve().parent.parent
DOMAIN = Settings.DOMAIN
SECRET_KEY = Settings.SECRET_KEY
DEBUG = Settings.DEBUG
ALLOWED_HOSTS = Settings.ALLOWED_HOSTS
CORS_ORIGIN_ALLOW_ALL = Settings.DEBUG
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "console": {
            "format": "%(asctime)s %(levelname)s [%(name)s:%(lineno)s] %(module)s %(process)d %(thread)d %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "console",
        },
    },
    "loggers": {
        "": {
            "level": Settings.LOG_LEVEL,
            "handlers": ["console"],
        },
    },
}

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.messages",
    "django.contrib.sessions",
    "django.contrib.sites",
    "django.contrib.staticfiles",
    "rest_framework",
    "dj_rest_auth",
    "dj_rest_auth.registration",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "corsheaders",
    "django_q",
    "users",
    "spritstat",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

ROOT_URLCONF = "spritstat.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "users" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "spritstat.wsgi.application"


# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": Database.NAME,
        "USER": Database.USER,
        "PASSWORD": Database.PASSWORD,
        "HOST": Database.HOST,
        "PORT": Database.PORT,
    }
}

# Email
EMAIL_BACKEND = Email.BACKEND
EMAIL_HOST = Email.HOST
EMAIL_PORT = Email.PORT
EMAIL_HOST_USER = Email.USERNAME
EMAIL_HOST_PASSWORD = Email.PASSWORD
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = Email.DEFAULT_FROM_EMAIL
SERVER_EMAIL = Email.SERVER_EMAIL


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "users.password_validation.ZxcvbnValidator",
        "OPTIONS": {"minimum_score": 2, "tokens": ["sprit", "stat"]},
    },
]


# Internationalization
LANGUAGE_CODE = "de-at"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATICFILES_STORAGE = "compress_staticfiles.storage.CompressStaticFilesStorage"
if Settings.STATIC_ROOT:
    STATIC_ROOT = Settings.STATIC_ROOT
else:
    # This is never used, but required for the storage class somehow
    STATIC_ROOT = BASE_DIR / "spritstat" / "static"
STATIC_URL = "/static/"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# API, authentication and security (rest-framework, dj-rest-auth, allauth)
AUTH_USER_MODEL = "users.CustomUser"

CSRF_COOKIE_SAMESITE = "Strict"
# False to allow extraction of the CSRF token from the cookie by the frontend
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SECURE = Settings.SECURE_COOKIE
SESSION_COOKIE_SAMESITE = "Strict"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = Settings.SECURE_COOKIE

AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

SITE_ID = 1
ACCOUNT_EMAIL_SUBJECT_PREFIX = "[SPRITSTAT] "
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_EMAIL_VERIFICATION = True
OLD_PASSWORD_FIELD_ENABLED = True

# Rest Framework and auth config
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 0,  # Disable pagination
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}

REST_AUTH_TOKEN_MODEL = None
REST_SESSION_LOGIN = True
REST_AUTH_SERIALIZERS = {
    "LOGIN_SERIALIZER": "users.serializers.CustomLoginSerializer",
}


# Application config

# Maximum number of locations a user is allowed to create
LOCATION_LIMIT = 10


# Scheduler configuration
Q_CLUSTER = {
    "name": "spritstat",
    "timeout": 5,
    "ack_failures": True,
    "max_attempts": 3,
    "save_limit": 0,
    "catch_up": False,
    "orm": "default",
}
