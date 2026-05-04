from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from core.permissions import IsTenantAdmin
from .models import ThemeConfig
from .serializers import ThemeConfigSerializer


class ThemeView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsTenantAdmin()]

    def get(self, request):
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response({"detail": "No tenant context."}, status=400)
        theme, _ = ThemeConfig.objects.get_or_create(tenant=tenant)
        return Response(ThemeConfigSerializer(theme, context={"request": request}).data)

    def put(self, request):
        tenant = request.tenant
        if not tenant:
            return Response({"detail": "No tenant context."}, status=400)
        theme, _ = ThemeConfig.objects.get_or_create(tenant=tenant)
        serializer = ThemeConfigSerializer(theme, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
