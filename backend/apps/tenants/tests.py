from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, UserTenantRole
from apps.tenants.models import Tenant, TenantDomain


def make_tenant(name="Tenant Tests Co", domain="tenanthost"):
    tenant = Tenant.objects.create(name=name, slug=name.lower().replace(" ", "-"))
    TenantDomain.objects.create(tenant=tenant, domain=domain, is_primary=True)
    return tenant


class TenantCurrentTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.user = User.objects.create_user(
            email="user@tenant.com",
            username="tenantuser",
            password="testpass123",
        )
        UserTenantRole.objects.create(user=self.user, tenant=self.tenant, role="admin")
        self.client = APIClient()

    def test_current_tenant_returned_for_known_host(self):
        resp = self.client.get("/api/v1/tenants/current/", HTTP_HOST="tenanthost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["name"], self.tenant.name)

    def test_unknown_host_returns_404(self):
        resp = self.client.get("/api/v1/tenants/current/", HTTP_HOST="unknownhost.com")
        self.assertIn(resp.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST])

    def test_tenant_slug_is_set_on_save(self):
        t = Tenant.objects.create(name="Auto Slug Test")
        self.assertEqual(t.slug, "auto-slug-test")


class TenantModelTests(TestCase):
    def test_str_representation(self):
        t = Tenant(name="Example Agency")
        self.assertEqual(str(t), "Example Agency")

    def test_is_active_default_true(self):
        t = Tenant.objects.create(name="Active Test", slug="active-test")
        self.assertTrue(t.is_active)

    def test_plan_default_starter(self):
        t = Tenant.objects.create(name="Plan Test", slug="plan-test")
        self.assertEqual(t.plan, Tenant.PLAN_STARTER)
