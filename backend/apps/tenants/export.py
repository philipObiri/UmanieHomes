"""
Celery task: packages all tenant data (JSON) + media files into a single ZIP.
The ZIP path/URL is stored in Redis for 24 hours keyed by task ID.
"""
import io
import json
import os
import zipfile
from datetime import date

from celery import shared_task
from django.core.serializers.json import DjangoJSONEncoder

from .models import Tenant, TenantSettings


def _qs_to_list(qs):
    return list(qs.values())


def _build_data_bundle(tenant: Tenant) -> dict:
    """Collect all tenant-scoped model data into a single dict."""
    from apps.cms.models import BlogPost, Page, TeamMember, MediaFile, Testimonial, FAQ
    from apps.crm.models import Lead, LeadNote, TourSchedule, Client
    from apps.helpdesk.models import Ticket
    from apps.financials.models import Deal, Invoice
    from apps.properties.models import Property, PropertyImage
    from apps.themes.models import ThemeConfig

    settings_obj = TenantSettings.objects.filter(tenant=tenant).first()

    data = {
        "tenant": {
            "name": tenant.name,
            "slug": tenant.slug,
            "email": tenant.email,
            "phone": tenant.phone,
            "address": tenant.address,
            "city": tenant.city,
            "country": tenant.country,
            "timezone": tenant.timezone,
            "tagline": tenant.tagline,
            "description": tenant.description,
            "website": tenant.website,
            "plan": tenant.plan,
        },
        "settings": (
            {k: v for k, v in settings_obj.__dict__.items() if not k.startswith("_")}
            if settings_obj
            else {}
        ),
        "theme": _qs_to_list(ThemeConfig.objects.filter(tenant=tenant)),
        "properties": _qs_to_list(Property.objects.filter(tenant=tenant)),
        "property_images": _qs_to_list(PropertyImage.objects.filter(tenant=tenant)),
        "leads": _qs_to_list(Lead.objects.filter(tenant=tenant)),
        "lead_notes": _qs_to_list(LeadNote.objects.filter(tenant=tenant)),
        "tour_schedules": _qs_to_list(TourSchedule.objects.filter(tenant=tenant)),
        "clients": _qs_to_list(Client.objects.filter(tenant=tenant)),
        "helpdesk_tickets": _qs_to_list(Ticket.objects.filter(tenant=tenant)),
        "blog_posts": _qs_to_list(BlogPost.objects.filter(tenant=tenant)),
        "pages": _qs_to_list(Page.objects.filter(tenant=tenant)),
        "team_members": _qs_to_list(TeamMember.objects.filter(tenant=tenant)),
        "media_files": _qs_to_list(MediaFile.objects.filter(tenant=tenant)),
        "testimonials": _qs_to_list(Testimonial.objects.filter(tenant=tenant)),
        "faqs": _qs_to_list(FAQ.objects.filter(tenant=tenant)),
        "deals": _qs_to_list(Deal.objects.filter(tenant=tenant)),
        "invoices": _qs_to_list(Invoice.objects.filter(tenant=tenant)),
    }
    return data


def _collect_media_files(tenant: Tenant):
    """Yield (archive_path, file_field) pairs for all tenant media."""
    from apps.cms.models import MediaFile, TeamMember
    from apps.properties.models import PropertyImage
    from apps.themes.models import ThemeConfig

    for mf in MediaFile.objects.filter(tenant=tenant):
        if mf.file:
            yield f"media/media_library/{os.path.basename(mf.file.name)}", mf.file

    for pi in PropertyImage.objects.filter(tenant=tenant):
        if pi.image:
            yield f"media/properties/{os.path.basename(pi.image.name)}", pi.image

    theme = ThemeConfig.objects.filter(tenant=tenant).first()
    if theme:
        if getattr(theme, "logo", None):
            yield f"media/branding/{os.path.basename(theme.logo.name)}", theme.logo
        if getattr(theme, "favicon", None):
            yield f"media/branding/{os.path.basename(theme.favicon.name)}", theme.favicon


@shared_task(bind=True, max_retries=2)
def generate_tenant_export(self, tenant_id: int) -> str:
    """
    Build and store a ZIP export for the given tenant.
    Returns a relative path under MEDIA_ROOT that can be served as a download.
    """
    import django.core.files.storage as dj_storage
    from django.conf import settings as dj_settings
    from django.core.cache import cache

    tenant = Tenant.objects.get(pk=tenant_id)
    today = date.today().isoformat()
    zip_name = f"{tenant.slug}_export_{today}.zip"

    # Build ZIP in-memory first, then save via Django's storage backend
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. Data bundle (JSON)
        data = _build_data_bundle(tenant)
        zf.writestr(
            f"{tenant.slug}_export_{today}/data/export.json",
            json.dumps(data, cls=DjangoJSONEncoder, indent=2, default=str),
        )

        # 2. Media files
        for archive_path, file_field in _collect_media_files(tenant):
            try:
                with file_field.open("rb") as fh:
                    zf.writestr(
                        f"{tenant.slug}_export_{today}/{archive_path}",
                        fh.read(),
                    )
            except Exception:
                pass  # Skip missing/corrupt files — don't abort the whole export

    buffer.seek(0)

    # Save to storage (local filesystem or S3, depending on config)
    storage = dj_storage.default_storage
    export_path = f"exports/{zip_name}"
    if storage.exists(export_path):
        storage.delete(export_path)
    storage.save(export_path, buffer)

    download_url = storage.url(export_path)

    # Cache the URL for 24 hours so the status endpoint can return it
    cache.set(f"tenant_export_{self.request.id}", download_url, timeout=86400)

    return download_url
