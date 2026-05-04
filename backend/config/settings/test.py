from .base import *

DEBUG = False

# Allow all hosts in tests (avoids 400 Bad Request for test domain names)
ALLOWED_HOSTS = ["*"]

# Use SQLite for fast test runs
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# No Redis — in-memory channel layer
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

# Run Celery tasks synchronously and in-memory (no broker needed)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = "cache+memory://"

# Fast password hasher for tests
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Silent email
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

# VAPID not needed in tests
VAPID_PRIVATE_KEY = ""
VAPID_PUBLIC_KEY = ""
VAPID_CLAIMS = {"sub": "mailto:test@example.com"}
