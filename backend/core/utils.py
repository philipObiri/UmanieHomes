import uuid
import os
from django.utils.text import slugify


def unique_upload_path(instance, filename, subdir="uploads"):
    ext = filename.rsplit(".", 1)[-1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join(subdir, unique_name)


def make_property_upload_path(instance, filename):
    return unique_upload_path(instance, filename, subdir="properties")


def make_avatar_upload_path(instance, filename):
    return unique_upload_path(instance, filename, subdir="avatars")


def make_media_upload_path(instance, filename):
    return unique_upload_path(instance, filename, subdir="media")


def make_logo_upload_path(instance, filename):
    ext = filename.rsplit(".", 1)[-1].lower()
    slug = slugify(instance.tenant.slug) if hasattr(instance, "tenant") else "platform"
    return f"logos/{slug}/{uuid.uuid4().hex}.{ext}"


def generate_reference(prefix="REF", length=8):
    import random
    import string
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=length))
    return f"{prefix}-{suffix}"
