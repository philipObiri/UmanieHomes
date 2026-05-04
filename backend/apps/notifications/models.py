from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from core.models import TenantAwareModel


class Notification(TenantAwareModel):
    TYPE_LEAD = "lead"
    TYPE_INQUIRY = "inquiry"
    TYPE_TICKET = "ticket"
    TYPE_DEAL = "deal"
    TYPE_SYSTEM = "system"
    TYPE_CHAT = "chat"

    TYPE_CHOICES = [
        (TYPE_LEAD, "New Lead"),
        (TYPE_INQUIRY, "New Inquiry"),
        (TYPE_TICKET, "New Ticket"),
        (TYPE_DEAL, "Deal Update"),
        (TYPE_SYSTEM, "System"),
        (TYPE_CHAT, "Chat"),
    ]

    recipient = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read", "-created_at"])]

    def __str__(self):
        return f"{self.notification_type}: {self.title} → {self.recipient.email}"


class PushSubscription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
    )
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"PushSubscription({self.user.email})"


@receiver(post_save, sender=Notification)
def notify_push(sender, instance, created, **kwargs):
    if created:
        from .tasks import send_web_push
        send_web_push.delay(instance.id)
