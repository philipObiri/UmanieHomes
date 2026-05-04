from .base import *

DEBUG = True

# SQLite for local development — no PostgreSQL server required.
# Switch DATABASE_URL in .env when PostgreSQL is ready.
import os
if not os.environ.get("DATABASE_URL"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

INSTALLED_APPS += ["debug_toolbar"]

MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE

INTERNAL_IPS = ["127.0.0.1"]

# Use console email in dev when Mailtrap creds not set
if not EMAIL_HOST_USER:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Windows: prefork pool causes PermissionError — use solo pool in development
CELERY_TASK_ALWAYS_EAGER = False
CELERY_WORKER_POOL = "solo"

# Use in-memory channel layer for local dev — no Redis required
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG",
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "INFO",
        },
    },
}
