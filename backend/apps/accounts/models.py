from django.contrib.auth.models import AbstractUser
from django.db import models
from core.models import TimestampedModel
from core.utils import make_avatar_upload_path


class User(AbstractUser):
    ROLE_PLATFORM_OWNER = "platform_owner"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    avatar = models.ImageField(upload_to=make_avatar_upload_path, null=True, blank=True)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    last_active = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        ordering = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}>"

    def get_full_name(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return name or self.email

    def get_role_for_tenant(self, tenant):
        """Returns the user's role string for a given tenant, or None."""
        try:
            membership = self.tenant_roles.get(tenant=tenant)
            return membership.role
        except UserTenantRole.DoesNotExist:
            return None

    def get_all_tenants(self):
        return [m.tenant for m in self.tenant_roles.select_related("tenant").all()]


class UserTenantRole(TimestampedModel):
    ROLE_ADMIN = "admin"
    ROLE_MANAGER = "manager"
    ROLE_AGENT = "agent"
    ROLE_SUPPORT = "support"
    ROLE_CLIENT = "client"

    ROLE_CHOICES = [
        (ROLE_ADMIN, "Admin"),
        (ROLE_MANAGER, "Manager"),
        (ROLE_AGENT, "Agent"),
        (ROLE_SUPPORT, "Support Staff"),
        (ROLE_CLIENT, "Client"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tenant_roles")
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, related_name="user_roles")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [("user", "tenant")]
        ordering = ["tenant__name", "role"]

    def __str__(self):
        return f"{self.user.get_full_name()} — {self.role} @ {self.tenant.name}"


class ActivityLog(TimestampedModel):
    """Tracks user actions for the CEO/platform dashboard."""
    ACTION_LOGIN = "login"
    ACTION_LOGOUT = "logout"
    ACTION_CREATE = "create"
    ACTION_UPDATE = "update"
    ACTION_DELETE = "delete"
    ACTION_VIEW = "view"
    ACTION_EXPORT = "export"

    ACTION_CHOICES = [
        (ACTION_LOGIN, "Login"),
        (ACTION_LOGOUT, "Logout"),
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
        (ACTION_VIEW, "View"),
        (ACTION_EXPORT, "Export"),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="activity_logs")
    tenant = models.ForeignKey("tenants.Tenant", on_delete=models.CASCADE, null=True, blank=True, related_name="activity_logs")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=100, blank=True)
    resource_id = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["tenant", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["action", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.user} | {self.action} | {self.resource_type}"


class PasswordResetToken(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.CharField(max_length=64, unique=True, db_index=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
