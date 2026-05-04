from django.contrib import admin
from .models import Tenant, TenantDomain, TenantSettings


class TenantDomainInline(admin.TabularInline):
    model = TenantDomain
    extra = 1


class TenantSettingsInline(admin.StackedInline):
    model = TenantSettings
    can_delete = False


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "plan", "is_active", "city", "country", "created_at"]
    list_filter = ["plan", "is_active", "country"]
    search_fields = ["name", "slug", "email"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [TenantDomainInline, TenantSettingsInline]


@admin.register(TenantDomain)
class TenantDomainAdmin(admin.ModelAdmin):
    list_display = ["domain", "tenant", "is_primary"]
    search_fields = ["domain", "tenant__name"]
