from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView, LogoutView, MeView, ChangePasswordView,
    PasswordResetRequestView, PasswordResetConfirmView,
    UserListView, UserDetailView, UserRoleView, ActivityLogView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("password/change/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="auth-reset-request"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="auth-reset-confirm"),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user-detail"),
    path("users/roles/", UserRoleView.as_view(), name="user-roles"),
    path("activity/", ActivityLogView.as_view(), name="activity-log"),
]
