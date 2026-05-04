from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, UserTenantRole
from apps.tenants.models import Tenant, TenantDomain
from apps.cms.models import BlogPost, TeamMember, Testimonial, MediaFile


def make_tenant(name="CMS Agency", domain="cmshost"):
    tenant = Tenant.objects.create(name=name, slug=name.lower().replace(" ", "-"))
    TenantDomain.objects.create(tenant=tenant, domain=domain, is_primary=True)
    return tenant


def make_user(tenant, email="editor@cms.com", role="admin"):
    user = User.objects.create_user(
        email=email,
        username=email.split("@")[0],
        password="testpass123",
    )
    UserTenantRole.objects.create(user=user, tenant=tenant, role=role)
    return user


class BlogPostTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.author = make_user(self.tenant)
        self.post = BlogPost.objects.create(
            tenant=self.tenant,
            title="My First Post",
            slug="my-first-post",
            content={"type": "doc", "content": []},
            author=self.author,
            is_published=True,
        )

    def test_published_posts_visible_publicly(self):
        client = APIClient()
        resp = client.get("/api/v1/cms/posts/", HTTP_HOST="cmshost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        slugs = [p["slug"] for p in resp.data.get("results", resp.data)]
        self.assertIn("my-first-post", slugs)

    def test_draft_post_not_visible_publicly(self):
        BlogPost.objects.create(
            tenant=self.tenant,
            title="Draft Post",
            slug="draft-post",
            content={},
            author=self.author,
            is_published=False,
        )
        client = APIClient()
        resp = client.get("/api/v1/cms/posts/", HTTP_HOST="cmshost")
        slugs = [p["slug"] for p in resp.data.get("results", resp.data)]
        self.assertNotIn("draft-post", slugs)

    def test_post_detail_by_slug(self):
        client = APIClient()
        resp = client.get("/api/v1/cms/posts/my-first-post/", HTTP_HOST="cmshost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["title"], "My First Post")


class TeamMemberTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.member = TeamMember.objects.create(
            tenant=self.tenant,
            name="John Doe",
            title="Senior Agent",
            bio="Experienced agent.",
        )

    def test_team_listing_returns_members(self):
        client = APIClient()
        resp = client.get("/api/v1/cms/team/", HTTP_HOST="cmshost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data.get("results", resp.data)
        names = [m["name"] for m in results]
        self.assertIn("John Doe", names)

    def test_team_member_str(self):
        self.assertEqual(str(self.member), "John Doe — Senior Agent")


class TestimonialTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant()
        self.admin = make_user(self.tenant)
        self.testimonial = Testimonial.objects.create(
            tenant=self.tenant,
            name="Happy Client",
            title="Property Buyer",
            quote="Excellent service!",
            rating=5,
            is_featured=True,
        )

    def test_testimonials_publicly_accessible(self):
        client = APIClient()
        resp = client.get("/api/v1/cms/testimonials/", HTTP_HOST="cmshost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        names = [t["name"] for t in resp.data.get("results", resp.data)]
        self.assertIn("Happy Client", names)

    def test_create_testimonial_requires_auth(self):
        client = APIClient()
        resp = client.post(
            "/api/v1/cms/testimonials/",
            {"name": "Anon", "quote": "Great!", "rating": 4},
            format="json",
            HTTP_HOST="cmshost",
        )
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class MediaListViewTests(TestCase):
    def setUp(self):
        self.tenant = make_tenant(name="Media Agency", domain="mediahost")
        self.admin = make_user(self.tenant, email="admin@media.com", role="admin")
        MediaFile.objects.create(
            tenant=self.tenant,
            name="gallery-photo.jpg",
            file_type="image",
            uploaded_by=self.admin,
            size=12345,
        )

    def test_media_list_public_get(self):
        """Unauthenticated GET should return 200 (public gallery page)."""
        client = APIClient()
        resp = client.get("/api/v1/cms/media/", HTTP_HOST="mediahost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        names = [m["name"] for m in resp.data.get("results", resp.data)]
        self.assertIn("gallery-photo.jpg", names)

    def test_media_list_filter_by_file_type(self):
        """file_type filter returns only matching records."""
        client = APIClient()
        resp = client.get("/api/v1/cms/media/?file_type=image", HTTP_HOST="mediahost")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for item in resp.data.get("results", resp.data):
            self.assertEqual(item["file_type"], "image")

    def test_media_upload_requires_auth(self):
        """POST without credentials should be rejected."""
        client = APIClient()
        resp = client.post(
            "/api/v1/cms/media/",
            {"name": "test.jpg", "file_type": "image"},
            HTTP_HOST="mediahost",
        )
        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
