from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, UserTenantRole
from apps.tenants.models import Tenant, TenantDomain
from .models import Notification, PushSubscription


def make_tenant(name="Test Agency", domain="testhost"):
    tenant = Tenant.objects.create(name=name, slug=name.lower().replace(" ", "-"))
    TenantDomain.objects.create(tenant=tenant, domain=domain, is_primary=True)
    return tenant


def make_user(tenant, email="agent@test.com", role="agent"):
    user = User.objects.create_user(
        email=email,
        username=email.split("@")[0],
        password="testpass123",
        first_name="Test",
        last_name="User",
    )
    UserTenantRole.objects.create(user=user, tenant=tenant, role=role)
    return user


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    # Simulate the tenant middleware by setting the host header
    return client


class NotificationListTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.user = make_user(self.tenant)
        self.client = auth_client(self.user)

    def _request(self, path, **kwargs):
        return self.client.get(path, HTTP_HOST="testhost", **kwargs)

    def test_list_returns_own_notifications(self):
        Notification.objects.create(
            tenant=self.tenant,
            recipient=self.user,
            notification_type=Notification.TYPE_SYSTEM,
            title="Hello",
            message="World",
        )
        resp = self._request("/api/v1/notifications/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data["count"], 1)

    def test_list_excludes_other_users_notifications(self):
        other = make_user(self.tenant, email="other@test.com")
        Notification.objects.create(
            tenant=self.tenant,
            recipient=other,
            notification_type=Notification.TYPE_SYSTEM,
            title="Not yours",
            message="Hidden",
        )
        resp = self._request("/api/v1/notifications/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["count"], 0)

    def test_unauthenticated_returns_401(self):
        resp = self.client_class().get("/api/v1/notifications/", HTTP_HOST="testhost")
        self.assertIn(resp.status_code, [401, 403])


class MarkReadTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.user = make_user(self.tenant)
        self.client = auth_client(self.user)

    def test_mark_specific_notifications_read(self):
        n = Notification.objects.create(
            tenant=self.tenant,
            recipient=self.user,
            notification_type=Notification.TYPE_SYSTEM,
            title="Unread",
            message="",
        )
        self.assertFalse(n.is_read)
        resp = self.client.post(
            "/api/v1/notifications/mark-read/",
            {"ids": [n.id]},
            format="json",
            HTTP_HOST="testhost",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        n.refresh_from_db()
        self.assertTrue(n.is_read)
        self.assertIsNotNone(n.read_at)

    def test_mark_all_read_when_no_ids(self):
        for i in range(3):
            Notification.objects.create(
                tenant=self.tenant,
                recipient=self.user,
                notification_type=Notification.TYPE_SYSTEM,
                title=f"N{i}",
                message="",
            )
        resp = self.client.post(
            "/api/v1/notifications/mark-read/",
            {},
            format="json",
            HTTP_HOST="testhost",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        unread = Notification.objects.filter(recipient=self.user, is_read=False).count()
        self.assertEqual(unread, 0)


class PushSubscriptionTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.user = make_user(self.tenant)
        self.client = auth_client(self.user)
        self.url = "/api/v1/notifications/push-subscriptions/"

    def test_create_subscription(self):
        payload = {
            "endpoint": "https://fcm.googleapis.com/fcm/send/test-endpoint",
            "p256dh": "BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "auth": "XXXXXXXXXXXXXXXX",
        }
        resp = self.client.post(self.url, payload, format="json", HTTP_HOST="testhost")
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertTrue(PushSubscription.objects.filter(user=self.user).exists())

    def test_upsert_same_endpoint(self):
        endpoint = "https://fcm.googleapis.com/fcm/send/test-endpoint"
        PushSubscription.objects.create(
            user=self.user, endpoint=endpoint, p256dh="OLD", auth="OLD"
        )
        payload = {"endpoint": endpoint, "p256dh": "NEW", "auth": "NEW"}
        resp = self.client.post(self.url, payload, format="json", HTTP_HOST="testhost")
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        sub = PushSubscription.objects.get(user=self.user, endpoint=endpoint)
        self.assertEqual(sub.p256dh, "NEW")

    def test_unauthenticated_cannot_subscribe(self):
        resp = APIClient().post(self.url, {}, format="json", HTTP_HOST="testhost")
        self.assertIn(resp.status_code, [401, 403])
