from django.urls import path
from .views import (
    CurrentTenantView, TenantSettingsView, TenantListView, TenantDetailView,
    TenantExportView, TenantExportStatusView,
)

urlpatterns = [
    path("current/", CurrentTenantView.as_view(), name="tenant-current"),
    path("settings/", TenantSettingsView.as_view(), name="tenant-settings"),
    path("export/", TenantExportView.as_view(), name="tenant-export"),
    path("export/<str:task_id>/", TenantExportStatusView.as_view(), name="tenant-export-status"),
    path("", TenantListView.as_view(), name="tenant-list"),
    path("<int:pk>/", TenantDetailView.as_view(), name="tenant-detail"),
]
