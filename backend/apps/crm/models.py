from django.db import models
from core.models import TenantAwareModel


class Lead(TenantAwareModel):
    SOURCE_WEBSITE = "website"
    SOURCE_REFERRAL = "referral"
    SOURCE_WALK_IN = "walk_in"
    SOURCE_CALL = "call"
    SOURCE_SOCIAL = "social"
    SOURCE_EMAIL = "email"
    SOURCE_OTHER = "other"

    SOURCE_CHOICES = [
        (SOURCE_WEBSITE, "Website"),
        (SOURCE_REFERRAL, "Referral"),
        (SOURCE_WALK_IN, "Walk-in"),
        (SOURCE_CALL, "Phone Call"),
        (SOURCE_SOCIAL, "Social Media"),
        (SOURCE_EMAIL, "Email"),
        (SOURCE_OTHER, "Other"),
    ]

    STATUS_NEW = "new"
    STATUS_CONTACTED = "contacted"
    STATUS_VIEWING = "viewing"
    STATUS_OFFER = "offer"
    STATUS_CLOSED = "closed"
    STATUS_LOST = "lost"

    STATUS_CHOICES = [
        (STATUS_NEW, "New"),
        (STATUS_CONTACTED, "Contacted"),
        (STATUS_VIEWING, "Viewing Scheduled"),
        (STATUS_OFFER, "Offer Made"),
        (STATUS_CLOSED, "Closed"),
        (STATUS_LOST, "Lost"),
    ]

    PRIORITY_LOW = "low"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_HIGH = "high"

    PRIORITY_CHOICES = [
        (PRIORITY_LOW, "Low"),
        (PRIORITY_MEDIUM, "Medium"),
        (PRIORITY_HIGH, "High"),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    message = models.TextField(blank=True)
    property = models.ForeignKey(
        "properties.Property", on_delete=models.SET_NULL, null=True, blank=True, related_name="leads"
    )
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default=SOURCE_WEBSITE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW, db_index=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    assigned_agent = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="leads"
    )
    budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    budget_currency = models.CharField(max_length=5, default="USD")
    preferred_locations = models.JSONField(default=list)
    property_types = models.JSONField(default=list)
    tour_scheduled_at = models.DateTimeField(null=True, blank=True)
    follow_up_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    lost_reason = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["tenant", "status"]),
            models.Index(fields=["tenant", "assigned_agent"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.status})"


class LeadNote(TenantAwareModel):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="notes")
    author = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True)
    content = models.TextField()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note on {self.lead.name} by {self.author}"


class TourSchedule(TenantAwareModel):
    STATUS_SCHEDULED = "scheduled"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    STATUS_NO_SHOW = "no_show"

    STATUS_CHOICES = [
        (STATUS_SCHEDULED, "Scheduled"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_NO_SHOW, "No Show"),
    ]

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="tours")
    property = models.ForeignKey(
        "properties.Property", on_delete=models.SET_NULL, null=True, blank=True, related_name="tours"
    )
    agent = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, related_name="tours")
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveSmallIntegerField(default=60)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SCHEDULED)
    notes = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self):
        return f"Tour: {self.lead.name} @ {self.scheduled_at:%Y-%m-%d %H:%M}"


class Client(TenantAwareModel):
    """Converted leads become Clients."""
    lead = models.OneToOneField(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name="client")
    user = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="client_profiles"
    )
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    assigned_agent = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="clients"
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
