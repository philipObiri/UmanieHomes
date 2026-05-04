import uuid
from django.db import models
from django.utils import timezone
from core.models import TenantAwareModel
from core.utils import generate_reference


class Ticket(TenantAwareModel):
    STATUS_OPEN = "open"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_RESOLVED = "resolved"
    STATUS_CLOSED = "closed"

    STATUS_CHOICES = [
        (STATUS_OPEN, "Open"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_RESOLVED, "Resolved"),
        (STATUS_CLOSED, "Closed"),
    ]

    PRIORITY_LOW = "low"
    PRIORITY_MEDIUM = "medium"
    PRIORITY_HIGH = "high"
    PRIORITY_URGENT = "urgent"

    PRIORITY_CHOICES = [
        (PRIORITY_LOW, "Low"),
        (PRIORITY_MEDIUM, "Medium"),
        (PRIORITY_HIGH, "High"),
        (PRIORITY_URGENT, "Urgent"),
    ]

    reference_number = models.CharField(max_length=20, unique=True, blank=True, db_index=True)
    subject = models.CharField(max_length=300)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN, db_index=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    client = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="submitted_tickets"
    )
    client_name = models.CharField(max_length=150, blank=True)
    client_email = models.EmailField(blank=True)
    assigned_to = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_tickets"
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    sla_deadline = models.DateTimeField(null=True, blank=True)
    tags = models.JSONField(default=list)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["tenant", "status"]),
            models.Index(fields=["tenant", "priority"]),
        ]

    def __str__(self):
        return f"#{self.reference_number} — {self.subject}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = generate_reference(prefix="TKT", length=6)
        if self.status == self.STATUS_RESOLVED and not self.resolved_at:
            self.resolved_at = timezone.now()
        super().save(*args, **kwargs)


class TicketMessage(TenantAwareModel):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    author_name = models.CharField(max_length=150, blank=True)
    content = models.TextField()
    is_internal = models.BooleanField(default=False)
    attachments = models.JSONField(default=list)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message on {self.ticket.reference_number}"


class ChatSession(TenantAwareModel):
    STATUS_ACTIVE = "active"
    STATUS_CLOSED = "closed"

    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_CLOSED, "Closed"),
    ]

    session_key = models.UUIDField(default=uuid.uuid4, unique=True, db_index=True)
    client = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="chat_sessions"
    )
    client_name = models.CharField(max_length=150, blank=True)
    client_email = models.EmailField(blank=True)
    agent = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="agent_chat_sessions"
    )
    ticket = models.OneToOneField(
        Ticket, on_delete=models.SET_NULL, null=True, blank=True, related_name="chat_session"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Chat {self.session_key} ({self.status})"


class ChatMessage(models.Model):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    sender_name = models.CharField(max_length=150, blank=True)
    message = models.TextField()
    is_from_agent = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{'Agent' if self.is_from_agent else 'Client'}: {self.message[:50]}"
