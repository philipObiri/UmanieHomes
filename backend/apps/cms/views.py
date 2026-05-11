from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsTenantAdmin, IsTenantManager, IsPublicOrTenantMember
from core.pagination import StandardPagination, SmallPagination
from .models import Category, Tag, MediaFile, Page, BlogPost, Testimonial, TeamMember, FAQ
from .serializers import (
    CategorySerializer, TagSerializer, MediaFileSerializer, PageSerializer,
    BlogPostListSerializer, BlogPostDetailSerializer,
    TestimonialSerializer, TeamMemberSerializer, FAQSerializer,
)


class TenantQuerysetMixin:
    def get_queryset(self):
        tenant = getattr(self.request, "tenant", None)
        if not tenant:
            return self.queryset.none()
        return self.queryset.filter(tenant=tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


# ─── Categories ──────────────────────────────────────────────────────────────

class CategoryListView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]


class CategoryDetailView(TenantQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]


# ─── Tags ────────────────────────────────────────────────────────────────────

class TagListView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]


# ─── Media ───────────────────────────────────────────────────────────────────

class MediaListView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    pagination_class = StandardPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["file_type"]
    search_fields = ["name", "alt_text"]

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]

    def get_queryset(self):
        qs = super().get_queryset()
        # Exclude team profile photos from public gallery listings.
        # Team photos are saved by the seed command with a 'team_' name prefix.
        user = self.request.user
        is_admin = user.is_authenticated and hasattr(user, 'get_role_for_tenant') and \
            user.get_role_for_tenant(getattr(self.request, 'tenant', None)) in ('admin', 'manager')
        if not is_admin:
            qs = qs.exclude(name__startswith='team_')
        return qs

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant, uploaded_by=self.request.user)


class MediaDetailView(TenantQuerysetMixin, generics.RetrieveDestroyAPIView):
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]


# ─── Pages ───────────────────────────────────────────────────────────────────

class PageListView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = Page.objects.all()
    serializer_class = PageSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.method == "GET" and not (
            self.request.user.is_authenticated and
            self.request.user.get_role_for_tenant(self.request.tenant) in ("admin", "manager")
        ):
            qs = qs.filter(is_published=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant, updated_by=self.request.user)


class PageDetailView(TenantQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = "slug"

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantAdmin()]

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


# ─── Blog Posts ──────────────────────────────────────────────────────────────

class BlogPostListView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = BlogPost.objects.all()
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["category__slug", "is_featured", "is_published"]
    search_fields = ["title", "excerpt"]
    ordering_fields = ["published_at", "views_count", "created_at"]
    ordering = ["-published_at"]

    def get_serializer_class(self):
        return BlogPostListSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        tenant = self.request.tenant
        if not (user.is_authenticated and user.get_role_for_tenant(tenant) in ("admin", "manager")):
            qs = qs.filter(is_published=True)
        return qs.select_related("author", "category", "featured_image")

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant, author=self.request.user)


class BlogPostDetailView(TenantQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostDetailSerializer
    lookup_field = "slug"

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        BlogPost.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ─── Testimonials ─────────────────────────────────────────────────────────────

class TestimonialListView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantAdmin()]


class TestimonialDetailView(TenantQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantAdmin()]


# ─── Team Members ─────────────────────────────────────────────────────────────

class TeamMemberListView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantAdmin()]


class TeamMemberDetailView(TenantQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantAdmin()]


# ─── FAQs ────────────────────────────────────────────────────────────────────

class FAQListView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = FAQ.objects.filter(is_published=True)
    serializer_class = FAQSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category"]

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantAdmin()]
