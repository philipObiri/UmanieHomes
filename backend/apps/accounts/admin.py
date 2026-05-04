from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserTenantRole, ActivityLog


class UserTenantRoleInline(admin.TabularInline):
    model = UserTenantRole
    extra = 1
    autocomplete_fields = ["tenant"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "first_name", "last_name", "is_verified", "is_superuser", "date_joined"]
    list_filter = ["is_superuser", "is_verified", "is_active"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["email"]
    inlines = [UserTenantRoleInline]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Profile", {"fields": ("phone", "avatar", "bio", "is_verified")}),
    )


@admin.register(UserTenantRole)
class UserTenantRoleAdmin(admin.ModelAdmin):
    list_display = ["user", "tenant", "role", "is_active", "created_at"]
    list_filter = ["role", "is_active", "tenant"]
    search_fields = ["user__email", "tenant__name"]


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["user", "tenant", "action", "resource_type", "created_at"]
    list_filter = ["action", "tenant"]
    search_fields = ["user__email", "resource_type"]
    readonly_fields = ["user", "tenant", "action", "resource_type", "resource_id",
                       "description", "ip_address", "user_agent", "created_at"]
