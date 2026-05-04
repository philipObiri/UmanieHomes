from django.contrib import admin
from .models import Deal, Commission, Invoice


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ["reference", "deal_type", "status", "deal_value", "currency", "agent", "tenant", "created_at"]
    list_filter = ["status", "deal_type", "tenant", "currency"]
    search_fields = ["reference", "client__name"]
    list_editable = ["status"]


@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    list_display = ["deal", "agent", "amount", "currency", "status", "tenant"]
    list_filter = ["status", "tenant"]
    list_editable = ["status"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["invoice_number", "client_name", "total", "currency", "status", "tenant", "created_at"]
    list_filter = ["status", "currency", "tenant"]
    search_fields = ["invoice_number", "client_name"]
