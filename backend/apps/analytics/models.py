from django.db import models
from core.models import TenantAwareModel


class PropertyView(TenantAwareModel):
    property = models.ForeignKey("properties.Property", on_delete=models.CASCADE, related_name="view_events")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True)
    referrer = models.URLField(blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["tenant", "property", "-created_at"])]


class PageView(TenantAwareModel):
    path = models.CharField(max_length=500)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True)
    referrer = models.URLField(blank=True)
    session_id = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["tenant", "path", "-created_at"])]
