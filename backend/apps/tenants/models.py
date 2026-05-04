from django.db import models
from django.utils.text import slugify
from core.models import TimestampedModel


class Tenant(TimestampedModel):
    PLAN_FREE = "free"
    PLAN_STARTER = "starter"
    PLAN_PROFESSIONAL = "professional"
    PLAN_ENTERPRISE = "enterprise"

    PLAN_CHOICES = [
        (PLAN_FREE, "Free"),
        (PLAN_STARTER, "Starter"),
        (PLAN_PROFESSIONAL, "Professional"),
        (PLAN_ENTERPRISE, "Enterprise"),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default=PLAN_STARTER)
    is_active = models.BooleanField(default=True)

    # Contact
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default="Ghana")
    timezone = models.CharField(max_length=50, default="Africa/Accra")

    # Business hours
    business_hours_start = models.TimeField(null=True, blank=True)
    business_hours_end = models.TimeField(null=True, blank=True)
    business_days = models.CharField(max_length=50, default="Mon-Fri")

    # Meta
    tagline = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class TenantDomain(TimestampedModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="domains")
    domain = models.CharField(max_length=253, unique=True, db_index=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["-is_primary", "domain"]

    def __str__(self):
        return f"{self.domain} → {self.tenant.name}"


class TenantSettings(TimestampedModel):
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name="settings")

    # Feature flags
    enable_blog = models.BooleanField(default=True)
    enable_gallery = models.BooleanField(default=True)
    enable_helpdesk = models.BooleanField(default=True)
    enable_chat_widget = models.BooleanField(default=True)
    enable_whatsapp = models.BooleanField(default=False)
    enable_newsletter = models.BooleanField(default=True)
    enable_testimonials = models.BooleanField(default=True)

    # Notification preferences
    notify_new_lead_email = models.BooleanField(default=True)
    notify_new_inquiry_email = models.BooleanField(default=True)
    notify_new_ticket_email = models.BooleanField(default=True)
    admin_notification_email = models.EmailField(blank=True)

    # Social
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)

    # WhatsApp API
    whatsapp_api_token = models.CharField(max_length=500, blank=True)
    whatsapp_phone_number_id = models.CharField(max_length=100, blank=True)

    # SMTP override (per tenant)
    smtp_host = models.CharField(max_length=200, blank=True)
    smtp_port = models.IntegerField(default=587)
    smtp_user = models.CharField(max_length=200, blank=True)
    smtp_password = models.CharField(max_length=500, blank=True)
    smtp_use_tls = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Tenant Settings"
        verbose_name_plural = "Tenant Settings"

    def __str__(self):
        return f"Settings for {self.tenant.name}"
