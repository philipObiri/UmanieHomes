from django.urls import path
from .views import NotificationListView, MarkReadView, PushSubscriptionView

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("mark-read/", MarkReadView.as_view(), name="notification-mark-read"),
    path("push-subscriptions/", PushSubscriptionView.as_view(), name="push-subscription"),
]
