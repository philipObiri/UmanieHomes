from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from celery.result import AsyncResult

from core.permissions import IsTenantAdmin, IsPlatformOwner
from .models import Tenant, TenantSettings
from .serializers import TenantPublicSerializer, TenantAdminSerializer, TenantSettingsSerializer
from .export import generate_tenant_export


class CurrentTenantView(APIView):
    """Returns the tenant resolved from the current domain. Public endpoint."""
    permission_classes = [AllowAny]

    def get(self, request):
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response({"detail": "No tenant found for this domain."}, status=404)
        serializer = TenantPublicSerializer(tenant)
        return Response(serializer.data)


class TenantSettingsView(APIView):
    permission_classes = [IsTenantAdmin]

    def get(self, request):
        tenant = request.tenant
        if not tenant:
            return Response({"detail": "No tenant context."}, status=400)
        settings_obj, _ = TenantSettings.objects.get_or_create(tenant=tenant)
        return Response(TenantSettingsSerializer(settings_obj).data)

    def patch(self, request):
        tenant = request.tenant
        if not tenant:
            return Response({"detail": "No tenant context."}, status=400)
        settings_obj, _ = TenantSettings.objects.get_or_create(tenant=tenant)
        serializer = TenantSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class TenantListView(APIView):
    """Platform owner only — lists all tenants."""
    permission_classes = [IsPlatformOwner]

    def get(self, request):
        tenants = Tenant.objects.all().order_by("name")
        serializer = TenantAdminSerializer(tenants, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TenantAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenant = serializer.save()
        TenantSettings.objects.create(tenant=tenant)
        return Response(TenantAdminSerializer(tenant).data, status=status.HTTP_201_CREATED)


class TenantDetailView(APIView):
    permission_classes = [IsPlatformOwner]

    def get_object(self, pk):
        return get_object_or_404(Tenant, pk=pk)

    def get(self, request, pk):
        return Response(TenantAdminSerializer(self.get_object(pk)).data)

    def patch(self, request, pk):
        tenant = self.get_object(pk)
        serializer = TenantAdminSerializer(tenant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        self.get_object(pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TenantExportView(APIView):
    """
    POST — kicks off a Celery task that builds a ZIP of all tenant data + media.
    Returns {"task_id": "..."} immediately.
    """
    permission_classes = [IsTenantAdmin]

    def post(self, request):
        tenant = request.tenant
        if not tenant:
            return Response({"detail": "No tenant context."}, status=400)
        task = generate_tenant_export.delay(tenant.pk)
        return Response({"task_id": task.id}, status=status.HTTP_202_ACCEPTED)


class TenantExportStatusView(APIView):
    """
    GET — polls the Celery task status.
    Returns {"status": "pending"|"ready"|"failed", "download_url": "..."}
    """
    permission_classes = [IsTenantAdmin]

    def get(self, request, task_id):
        result = AsyncResult(task_id)
        if result.state in ("PENDING", "STARTED", "RETRY"):
            return Response({"status": "pending"})
        if result.state == "SUCCESS":
            download_url = cache.get(f"tenant_export_{task_id}") or result.result
            return Response({"status": "ready", "download_url": download_url})
        return Response({"status": "failed", "detail": str(result.info)}, status=500)
