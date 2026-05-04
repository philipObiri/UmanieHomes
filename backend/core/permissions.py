from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsPlatformOwner(BasePermission):
    """Only the platform superuser (no tenant) can access."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class IsTenantAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return False
        return request.user.get_role_for_tenant(tenant) in ("admin",)


class IsTenantManager(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return False
        return request.user.get_role_for_tenant(tenant) in ("admin", "manager")


class IsTenantAgent(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return False
        return request.user.get_role_for_tenant(tenant) in ("admin", "manager", "agent")


class IsTenantSupport(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return False
        return request.user.get_role_for_tenant(tenant) in ("admin", "manager", "support")


class IsTenantMember(BasePermission):
    """Any authenticated user with any role in the current tenant."""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return False
        return request.user.get_role_for_tenant(tenant) is not None


class IsPublicOrTenantMember(BasePermission):
    """Read-only for public, full access for tenant members."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return False
        return request.user.get_role_for_tenant(tenant) is not None
