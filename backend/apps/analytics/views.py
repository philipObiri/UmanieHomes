from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta

from core.permissions import IsTenantManager, IsPlatformOwner


class TenantDashboardView(APIView):
    """Summary analytics for the tenant-level ERP dashboard."""
    permission_classes = [IsTenantManager]

    def get(self, request):
        tenant = request.tenant
        if not tenant:
            return Response({"detail": "No tenant context."}, status=400)

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        from apps.properties.models import Property
        from apps.crm.models import Lead
        from apps.helpdesk.models import Ticket
        from apps.financials.models import Deal

        total_properties = Property.objects.filter(tenant=tenant, is_published=True).count()
        available_properties = Property.objects.filter(tenant=tenant, status="available", is_published=True).count()
        sold_properties = Property.objects.filter(tenant=tenant, status="sold").count()

        total_leads = Lead.objects.filter(tenant=tenant).count()
        new_leads = Lead.objects.filter(tenant=tenant, created_at__gte=thirty_days_ago).count()
        active_leads = Lead.objects.filter(tenant=tenant, status__in=["new", "contacted", "viewing", "offer"]).count()

        open_tickets = Ticket.objects.filter(tenant=tenant, status__in=["open", "in_progress"]).count()

        total_revenue = Deal.objects.filter(tenant=tenant, status="closed").aggregate(
            total=Sum("deal_value")
        )["total"] or 0

        month_revenue = Deal.objects.filter(
            tenant=tenant, status="closed", closed_at__gte=thirty_days_ago
        ).aggregate(total=Sum("deal_value"))["total"] or 0

        # Lead funnel
        lead_funnel = Lead.objects.filter(tenant=tenant).values("status").annotate(count=Count("id"))
        funnel_dict = {item["status"]: item["count"] for item in lead_funnel}

        # Property views last 30 days
        from .models import PropertyView
        views_30d = PropertyView.objects.filter(tenant=tenant, created_at__gte=thirty_days_ago).count()

        # Top properties by inquiries
        top_properties = Property.objects.filter(tenant=tenant).order_by("-inquiry_count")[:5].values(
            "title", "inquiry_count", "views_count", "status"
        )

        return Response({
            "properties": {
                "total": total_properties,
                "available": available_properties,
                "sold": sold_properties,
            },
            "leads": {
                "total": total_leads,
                "new_this_month": new_leads,
                "active": active_leads,
                "funnel": funnel_dict,
            },
            "helpdesk": {
                "open_tickets": open_tickets,
            },
            "financials": {
                "total_revenue": float(total_revenue),
                "month_revenue": float(month_revenue),
            },
            "traffic": {
                "property_views_30d": views_30d,
            },
            "top_properties": list(top_properties),
        })


class PlatformDashboardView(APIView):
    """CEO/platform owner dashboard — cross-tenant aggregated analytics."""
    permission_classes = [IsPlatformOwner]

    def get(self, request):
        from apps.tenants.models import Tenant
        from apps.properties.models import Property
        from apps.crm.models import Lead
        from apps.helpdesk.models import Ticket
        from apps.financials.models import Deal
        from apps.accounts.models import User, ActivityLog

        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_tenants = Tenant.objects.filter(is_active=True).count()
        new_tenants_30d = Tenant.objects.filter(is_active=True, created_at__gte=thirty_days_ago).count()

        total_users = User.objects.filter(is_active=True).count()
        active_users_30d = ActivityLog.objects.filter(
            action="login", created_at__gte=thirty_days_ago
        ).values("user").distinct().count()

        total_properties = Property.objects.count()
        total_leads = Lead.objects.count()
        total_revenue = Deal.objects.filter(status="closed").aggregate(total=Sum("deal_value"))["total"] or 0
        month_revenue = Deal.objects.filter(
            status="closed", closed_at__gte=thirty_days_ago
        ).aggregate(total=Sum("deal_value"))["total"] or 0

        # Revenue by tenant
        revenue_by_tenant = Deal.objects.filter(status="closed").values(
            "tenant__name"
        ).annotate(revenue=Sum("deal_value")).order_by("-revenue")[:10]

        # Tenant activity
        tenant_stats = Tenant.objects.annotate(
            property_count=Count("properties_property_set"),
            lead_count=Count("crm_lead_set"),
        ).values("name", "plan", "property_count", "lead_count")[:20]

        # Activity feed
        recent_activity = ActivityLog.objects.select_related("user", "tenant").order_by("-created_at")[:50]
        activity_data = [
            {
                "user": a.user.get_full_name() if a.user else "System",
                "tenant": a.tenant.name if a.tenant else "Platform",
                "action": a.action,
                "resource_type": a.resource_type,
                "timestamp": a.created_at.isoformat(),
            }
            for a in recent_activity
        ]

        return Response({
            "platform": {
                "total_tenants": total_tenants,
                "new_tenants_30d": new_tenants_30d,
                "total_users": total_users,
                "active_users_30d": active_users_30d,
            },
            "business": {
                "total_properties": total_properties,
                "total_leads": total_leads,
                "total_revenue": float(total_revenue),
                "month_revenue": float(month_revenue),
            },
            "revenue_by_tenant": list(revenue_by_tenant),
            "tenant_stats": list(tenant_stats),
            "recent_activity": activity_data,
        })
