from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import UserTenantRole, ActivityLog

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        request = self.context.get("request")
        tenant = getattr(request, "tenant", None)

        data["user"] = UserProfileSerializer(user, context=self.context).data
        data["role"] = user.get_role_for_tenant(tenant) if tenant else (
            "platform_owner" if user.is_superuser else None
        )

        # Log login activity
        ActivityLog.objects.create(
            user=user,
            tenant=tenant,
            action=ActivityLog.ACTION_LOGIN,
            resource_type="auth",
            ip_address=_get_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", "") if request else "",
        )
        return data


def _get_ip(request):
    if not request:
        return None
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    return x_forwarded.split(",")[0].strip() if x_forwarded else request.META.get("REMOTE_ADDR")


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name",
            "full_name", "phone", "bio", "avatar_url", "is_verified",
            "is_superuser", "last_active", "date_joined",
        ]
        read_only_fields = ["id", "email", "is_superuser", "date_joined", "last_active"]

    def get_full_name(self, obj):
        return obj.get_full_name()

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=UserTenantRole.ROLE_CHOICES, write_only=True, required=False)

    class Meta:
        model = User
        fields = ["email", "username", "first_name", "last_name", "phone", "password", "role"]

    def create(self, validated_data):
        role = validated_data.pop("role", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        request = self.context.get("request")
        tenant = getattr(request, "tenant", None)
        if role and tenant:
            UserTenantRole.objects.create(user=user, tenant=tenant, role=role)

        return user


class UserTenantRoleSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = UserTenantRole
        fields = ["id", "user", "user_email", "user_name", "role", "is_active", "created_at"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    tenant_name = serializers.CharField(source="tenant.name", read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id", "user", "user_name", "tenant", "tenant_name",
            "action", "resource_type", "resource_id", "description",
            "ip_address", "created_at",
        ]
