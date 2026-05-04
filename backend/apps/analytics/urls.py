from django.urls import path
from .views import TenantDashboardView, PlatformDashboardView

urlpatterns = [
    path("dashboard/", TenantDashboardView.as_view(), name="analytics-dashboard"),
    path("platform/", PlatformDashboardView.as_view(), name="analytics-platform"),
]
