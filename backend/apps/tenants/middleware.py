from django.http import Http404
from .models import TenantDomain


class TenantMiddleware:
    """
    Resolves the current tenant from the request host and injects it
    into request.tenant. Falls back gracefully in development when
    hitting localhost (uses the first active tenant).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = self._resolve_tenant(request)
        return self.get_response(request)

    @staticmethod
    def _resolve_tenant(request):
        from django.conf import settings

        host = request.get_host().split(":")[0].lower()
        # Strip www. prefix so both www and non-www resolve to the same tenant
        bare_host = host[4:] if host.startswith("www.") else host

        # Try exact match, then bare-host fallback
        for lookup in (host, bare_host):
            try:
                domain_obj = TenantDomain.objects.select_related("tenant").get(
                    domain=lookup, tenant__is_active=True
                )
                return domain_obj.tenant
            except TenantDomain.DoesNotExist:
                continue

        # In development, fall back to first active tenant so local dev works
        if settings.DEBUG and bare_host in ("localhost", "127.0.0.1"):
            from .models import Tenant
            return Tenant.objects.filter(is_active=True).first()

        # Admin and API calls without a tenant domain (platform-level)
        if request.path.startswith("/admin/") or request.path.startswith("/api/v1/tenants/"):
            return None

        return None
