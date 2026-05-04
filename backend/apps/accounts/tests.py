from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, UserTenantRole
from apps.tenants.models import Tenant, TenantDomain


def make_tenant(name="Auth Test Agency", domain="authhost"):
    tenant = Tenant.objects.create(name=name, slug=name.lower().replace(" ", "-"))
    TenantDomain.objects.create(tenant=tenant, domain=domain, is_primary=True)
    return tenant


class LoginTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.user = User.objects.create_user(
            email="login@test.com",
            username="loginuser",
            password="StrongPass1!",
            first_name="Login",
            last_name="User",
        )
        UserTenantRole.objects.create(user=self.user, tenant=self.tenant, role="agent")
        self.client = APIClient()

    def test_login_returns_tokens(self):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "login@test.com", "password": "StrongPass1!"},
            format="json",
            HTTP_HOST="authhost",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_wrong_password_returns_401(self):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "login@test.com", "password": "WrongPassword"},
            format="json",
            HTTP_HOST="authhost",
        )
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST])

    def test_nonexistent_user_returns_401(self):
        resp = self.client.post(
            "/api/v1/auth/login/",
            {"email": "nobody@test.com", "password": "Whatever"},
            format="json",
            HTTP_HOST="authhost",
        )
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST])

    def test_me_requires_auth(self):
        resp = self.client.get("/api/v1/auth/me/", HTTP_HOST="authhost")
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_me_returns_user_info(self):
        self.client.force_authenticate(user=self.user)
        resp = self.client.get("/api/v1/auth/me/", HTTP_HOST="authhost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["email"], self.user.email)
