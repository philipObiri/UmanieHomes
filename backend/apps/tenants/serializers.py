from rest_framework import serializers
from .models import Tenant, TenantDomain, TenantSettings


class TenantDomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantDomain
        fields = ["id", "domain", "is_primary"]


class TenantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenantSettings
        exclude = ["id", "tenant", "created_at", "updated_at",
                   "smtp_password", "whatsapp_api_token"]


class TenantPublicSerializer(serializers.ModelSerializer):
    """Safe public-facing tenant info (no internal config)."""
    domains = TenantDomainSerializer(many=True, read_only=True)
    settings = TenantSettingsSerializer(read_only=True)

    class Meta:
        model = Tenant
        fields = [
            "id", "name", "slug", "tagline", "description", "website",
            "email", "phone", "address", "city", "country",
            "business_hours_start", "business_hours_end", "business_days",
            "timezone", "domains", "settings",
        ]


class TenantAdminSerializer(serializers.ModelSerializer):
    domains = TenantDomainSerializer(many=True, read_only=True)
    settings = TenantSettingsSerializer(read_only=True)

    class Meta:
        model = Tenant
        fields = "__all__"
