from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

api_v1 = [
    # OpenAPI schema + interactive docs
    path("schema/",  SpectacularAPIView.as_view(), name="schema"),
    path("",         SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("redoc/",   SpectacularRedocView.as_view(url_name="schema"),   name="redoc"),

    path("auth/", include("apps.accounts.urls")),
    path("tenants/", include("apps.tenants.urls")),
    path("themes/", include("apps.themes.urls")),
    path("cms/", include("apps.cms.urls")),
    path("properties/", include("apps.properties.urls")),
    path("crm/", include("apps.crm.urls")),
    path("helpdesk/", include("apps.helpdesk.urls")),
    path("analytics/", include("apps.analytics.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("financials/", include("apps.financials.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # Serve frontend/public/ at root so /gallery/, /icons/, /team/ resolve when
    # the app is accessed directly via the Django dev server (port 8000).
    from django.views.static import serve as _serve
    from pathlib import Path as _Path
    _frontend_public = settings.BASE_DIR.parent / "frontend" / "public"
    if _frontend_public.exists():
        urlpatterns += [path("<path:path>", _serve, {"document_root": str(_frontend_public)})]
    try:
        import debug_toolbar
        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass
