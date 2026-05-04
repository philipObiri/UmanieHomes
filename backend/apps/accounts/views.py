from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.crypto import get_random_string

from core.permissions import IsTenantAdmin, IsPlatformOwner
from core.pagination import StandardPagination
from .models import UserTenantRole, ActivityLog, PasswordResetToken
from .serializers import (
    CustomTokenObtainPairSerializer, UserProfileSerializer, UserCreateSerializer,
    UserTenantRoleSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ActivityLogSerializer,
)

User = get_user_model()


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass

        tenant = getattr(request, "tenant", None)
        ActivityLog.objects.create(
            user=request.user,
            tenant=tenant,
            action=ActivityLog.ACTION_LOGOUT,
            resource_type="auth",
        )
        return Response({"detail": "Logged out successfully."})


class MeView(APIView):
    def get(self, request):
        return Response(UserProfileSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Password changed successfully."})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email=email)
            token_str = get_random_string(64)
            expires_at = timezone.now() + timezone.timedelta(hours=2)
            PasswordResetToken.objects.create(user=user, token=token_str, expires_at=expires_at)
            # Send email via Celery task
            from apps.notifications.tasks import send_password_reset_email
            send_password_reset_email.delay(user.id, token_str)
        except User.DoesNotExist:
            pass  # Don't reveal if email exists
        return Response({"detail": "If the email exists, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from .serializers import PasswordResetConfirmSerializer
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_str = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            reset_token = PasswordResetToken.objects.get(
                token=token_str, is_used=False, expires_at__gt=timezone.now()
            )
        except PasswordResetToken.DoesNotExist:
            return Response({"detail": "Invalid or expired token."}, status=400)

        user = reset_token.user
        user.set_password(new_password)
        user.save()
        reset_token.is_used = True
        reset_token.save()
        return Response({"detail": "Password reset successful."})


class UserListView(generics.ListCreateAPIView):
    permission_classes = [IsTenantAdmin]
    serializer_class = UserProfileSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        tenant = self.request.tenant
        if not tenant:
            return User.objects.none()
        user_ids = UserTenantRole.objects.filter(tenant=tenant).values_list("user_id", flat=True)
        return User.objects.filter(id__in=user_ids).order_by("first_name")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserProfileSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTenantAdmin]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        tenant = self.request.tenant
        if not tenant:
            return User.objects.none()
        user_ids = UserTenantRole.objects.filter(tenant=tenant).values_list("user_id", flat=True)
        return User.objects.filter(id__in=user_ids)


class UserRoleView(APIView):
    permission_classes = [IsTenantAdmin]

    def get(self, request):
        tenant = request.tenant
        roles = UserTenantRole.objects.filter(tenant=tenant).select_related("user")
        return Response(UserTenantRoleSerializer(roles, many=True).data)

    def post(self, request):
        tenant = request.tenant
        serializer = UserTenantRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(tenant=tenant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ActivityLogView(generics.ListAPIView):
    """Available to tenant admins for their tenant, and platform owner for all."""
    serializer_class = ActivityLogSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            qs = ActivityLog.objects.all()
        else:
            tenant = self.request.tenant
            qs = ActivityLog.objects.filter(tenant=tenant)

        action = self.request.query_params.get("action")
        if action:
            qs = qs.filter(action=action)

        return qs.select_related("user", "tenant").order_by("-created_at")

    def get_permissions(self):
        user = self.request.user
        if hasattr(user, "is_superuser") and user.is_superuser:
            return [IsPlatformOwner()]
        return [IsTenantAdmin()]
