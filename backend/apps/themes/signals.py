import io
import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.base import ContentFile
from .models import ThemeConfig


@receiver(post_save, sender=ThemeConfig)
def auto_generate_favicon(sender, instance, **kwargs):
    """
    When a ThemeConfig logo is saved and no favicon exists (or the logo just
    changed), generate a 32×32 PNG favicon from the logo using Pillow and save
    it to the favicon field.

    This runs in a post_save signal so it cannot trigger an infinite loop —
    we use update_fields to skip re-firing the signal for the favicon save.
    """
    if not instance.logo:
        return

    # Skip if favicon already exists and logo hasn't changed
    # (detect logo change by comparing stored filename to avoid re-processing)
    if instance.favicon:
        logo_stem = os.path.splitext(os.path.basename(instance.logo.name))[0]
        favicon_name = os.path.basename(instance.favicon.name)
        if favicon_name.startswith(f"fav_{logo_stem}"):
            return

    try:
        from PIL import Image

        instance.logo.seek(0)
        img = Image.open(instance.logo).convert("RGBA")

        # Crop to square (centre crop)
        w, h = img.size
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        img = img.crop((left, top, left + side, top + side))

        # Resize to 32×32 with high-quality downsampling
        img = img.resize((32, 32), Image.LANCZOS)

        # Save to in-memory buffer as PNG
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        buf.seek(0)

        logo_stem = os.path.splitext(os.path.basename(instance.logo.name))[0]
        favicon_filename = f"fav_{logo_stem}.png"

        # Disconnect the signal temporarily to avoid recursion
        post_save.disconnect(auto_generate_favicon, sender=ThemeConfig)
        try:
            instance.favicon.save(favicon_filename, ContentFile(buf.read()), save=True)
        finally:
            post_save.connect(auto_generate_favicon, sender=ThemeConfig)

    except Exception:
        pass  # Favicon generation is best-effort; never crash a logo upload
