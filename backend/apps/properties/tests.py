from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, UserTenantRole
from apps.tenants.models import Tenant, TenantDomain
from apps.properties.models import Property


def make_tenant(name="Prop Agency", domain="prophost"):
    tenant = Tenant.objects.create(name=name, slug=name.lower().replace(" ", "-"))
    TenantDomain.objects.create(tenant=tenant, domain=domain, is_primary=True)
    return tenant


def make_user(tenant, email="agent@prop.com", role="agent"):
    user = User.objects.create_user(
        email=email,
        username=email.split("@")[0],
        password="testpass123",
        first_name="Agent",
        last_name="Smith",
    )
    UserTenantRole.objects.create(user=user, tenant=tenant, role=role)
    return user


def make_property(tenant, user, **kwargs):
    defaults = dict(
        tenant=tenant,
        title="Test Villa",
        slug="test-villa",
        description="A beautiful test villa",
        property_type="villa",
        listing_type="sale",
        status="available",
        price=500000,
        currency="GHS",
        bedrooms=4,
        bathrooms=3,
        sqft=3000,
        address="123 Test Street",
        city="Accra",
        country="Ghana",
        is_published=True,
        created_by=user,
    )
    defaults.update(kwargs)
    return Property.objects.create(**defaults)


class PropertyListTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.user = make_user(self.tenant)
        self.prop = make_property(self.tenant, self.user)

    def test_public_listing_accessible_without_auth(self):
        client = APIClient()
        resp = client.get("/api/v1/properties/listings/", HTTP_HOST="prophost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data["count"], 1)

    def test_unpublished_property_hidden_from_public(self):
        self.prop.is_published = False
        self.prop.save()
        client = APIClient()
        resp = client.get("/api/v1/properties/listings/", HTTP_HOST="prophost")
        ids = [p["id"] for p in resp.data["results"]]
        self.assertNotIn(self.prop.id, ids)

    def test_property_detail_accessible(self):
        client = APIClient()
        resp = client.get(
            f"/api/v1/properties/listings/{self.prop.id}/", HTTP_HOST="prophost"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["title"], self.prop.title)

    def test_search_by_keyword(self):
        client = APIClient()
        resp = client.get(
            "/api/v1/properties/listings/",
            {"search": "Villa"},
            HTTP_HOST="prophost",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in resp.data["results"]]
        self.assertTrue(any("Villa" in t for t in titles))


class PropertyCreateTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.admin = make_user(self.tenant, email="admin@prop.com", role="admin")
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_admin_can_create_property(self):
        payload = {
            "title": "New Duplex",
            "description": "A new duplex listing",
            "property_type": "duplex",
            "listing_type": "rent",
            "status": "available",
            "price": "2500.00",
            "currency": "GHS",
            "address": "456 Test Ave",
            "city": "Tema",
            "country": "Ghana",
        }
        resp = self.client.post(
            "/api/v1/properties/listings/",
            payload,
            format="json",
            HTTP_HOST="prophost",
        )
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertEqual(resp.data["title"], "New Duplex")

    def test_agent_cannot_create_property(self):
        agent = make_user(self.tenant, email="junior@prop.com", role="agent")
        client = APIClient()
        client.force_authenticate(user=agent)
        payload = {"title": "Agent Villa", "property_type": "villa", "listing_type": "sale", "price": "100"}
        resp = client.post(
            "/api/v1/properties/listings/",
            payload,
            format="json",
            HTTP_HOST="prophost",
        )
        self.assertIn(resp.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_401_UNAUTHORIZED])


class PropertyFeaturedTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.user = make_user(self.tenant)

    def test_featured_endpoint_returns_only_featured(self):
        make_property(self.tenant, self.user, is_featured=True, slug="featured-villa")
        make_property(self.tenant, self.user, is_featured=False, slug="regular-villa")
        client = APIClient()
        resp = client.get("/api/v1/properties/featured/", HTTP_HOST="prophost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data if isinstance(resp.data, list) else resp.data.get("results", [])
        self.assertTrue(all(p.get("is_featured") for p in results))
