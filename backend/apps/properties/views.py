from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from core.permissions import IsTenantManager, IsPublicOrTenantMember
from core.pagination import StandardPagination
from .models import Property, PropertyImage, Inquiry
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer,
    PropertyWriteSerializer, PropertyImageSerializer, InquirySerializer,
)
from .filters import PropertyFilter


class PropertyListView(generics.ListCreateAPIView):
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ["title", "description", "city", "area", "address", "reference_id"]
    ordering_fields = ["price", "created_at", "views_count", "bedrooms"]
    ordering = ["-is_featured", "-created_at"]

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]

    def get_queryset(self):
        tenant = getattr(self.request, "tenant", None)
        if not tenant:
            return Property.objects.none()
        qs = Property.objects.filter(tenant=tenant).prefetch_related("images")
        user = self.request.user
        if not (user.is_authenticated and user.get_role_for_tenant(tenant) in ("admin", "manager", "agent")):
            qs = qs.filter(is_published=True, status=Property.STATUS_AVAILABLE)
        return qs

    def get_serializer_class(self):
        return PropertyWriteSerializer if self.request.method == "POST" else PropertyListSerializer

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user,
            assigned_agent=self.request.user,
        )


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    lookup_field = "slug"

    def get_object(self):
        queryset = self.get_queryset()
        # Support both slug and pk lookups
        slug_or_pk = self.kwargs.get("slug") or self.kwargs.get("pk")
        if slug_or_pk and str(slug_or_pk).isdigit():
            obj = generics.get_object_or_404(queryset, pk=slug_or_pk)
        else:
            obj = generics.get_object_or_404(queryset, slug=slug_or_pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "GET" else [IsTenantManager()]

    def get_queryset(self):
        tenant = getattr(self.request, "tenant", None)
        if not tenant:
            return Property.objects.none()
        return Property.objects.filter(tenant=tenant).prefetch_related("images")

    def get_serializer_class(self):
        return PropertyWriteSerializer if self.request.method in ("PUT", "PATCH") else PropertyDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Property.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        # Track analytics event
        try:
            from apps.analytics.models import PropertyView
            PropertyView.objects.create(
                tenant=instance.tenant,
                property=instance,
                ip_address=_get_ip(request),
            )
        except Exception:
            pass
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class FeaturedPropertiesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response([])
        limit = int(request.query_params.get("limit", 6))
        properties = Property.objects.filter(
            tenant=tenant, is_featured=True, is_published=True, status=Property.STATUS_AVAILABLE
        ).prefetch_related("images")[:limit]
        return Response(PropertyListSerializer(properties, many=True, context={"request": request}).data)


class PropertyImageView(APIView):
    permission_classes = [IsTenantManager]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        property_obj = self._get_property(request, pk)
        images = property_obj.images.all()
        return Response(PropertyImageSerializer(images, many=True, context={"request": request}).data)

    def post(self, request, pk):
        property_obj = self._get_property(request, pk)
        serializer = PropertyImageSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(property=property_obj)
        # If first image, make it primary
        if property_obj.images.count() == 1:
            property_obj.images.update(is_primary=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _get_property(self, request, pk):
        return Property.objects.get(pk=pk, tenant=request.tenant)


class PropertyImageDeleteView(APIView):
    permission_classes = [IsTenantManager]

    def delete(self, request, pk, img_pk):
        try:
            img = PropertyImage.objects.get(pk=img_pk, property__pk=pk, property__tenant=request.tenant)
            img.image.delete(save=False)
            img.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PropertyImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=404)


class InquireView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        try:
            property_obj = Property.objects.get(pk=pk, tenant=request.tenant, is_published=True)
        except Property.DoesNotExist:
            return Response({"detail": "Property not found."}, status=404)

        serializer = InquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save(tenant=request.tenant, property=property_obj)

        # Increment inquiry count
        Property.objects.filter(pk=property_obj.pk).update(inquiry_count=property_obj.inquiry_count + 1)

        # Auto-create a CRM Lead
        try:
            from apps.crm.models import Lead
            Lead.objects.create(
                tenant=request.tenant,
                name=inquiry.name,
                email=inquiry.email,
                phone=inquiry.phone,
                message=inquiry.message,
                property=property_obj,
                source=Lead.SOURCE_WEBSITE,
            )
        except Exception:
            pass

        # Send notification email
        try:
            from apps.notifications.tasks import send_new_inquiry_notification
            send_new_inquiry_notification.delay(inquiry.id)
        except Exception:
            pass

        return Response({"detail": "Inquiry submitted successfully."}, status=status.HTTP_201_CREATED)


def _get_ip(request):
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    return x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR")
