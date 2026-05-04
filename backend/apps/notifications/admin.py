from django.contrib import admin
from .models import Notification, PushSubscription


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "notification_type", "recipient", "tenant", "is_read", "created_at"]
    list_filter = ["notification_type", "is_read", "tenant"]
    search_fields = ["title", "recipient__email"]


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["user", "created_at"]
    search_fields = ["user__email", "endpoint"]
    readonly_fields = ["endpoint", "p256dh", "auth", "created_at"]
