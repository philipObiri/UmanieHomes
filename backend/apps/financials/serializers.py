from rest_framework import serializers
from .models import Deal, Commission, Invoice


class DealSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    commission_amount_display = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        exclude = ["tenant"]
        read_only_fields = ["id", "reference", "commission_amount", "closed_at", "created_at", "updated_at"]

    def get_commission_amount_display(self, obj):
        return f"{obj.currency} {obj.commission_amount:,.2f}"


class CommissionSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    deal_reference = serializers.CharField(source="deal.reference", read_only=True)

    class Meta:
        model = Commission
        exclude = ["tenant"]
        read_only_fields = ["id", "created_at", "updated_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    issued_by_name = serializers.CharField(source="issued_by.get_full_name", read_only=True)

    class Meta:
        model = Invoice
        exclude = ["tenant"]
        read_only_fields = ["id", "invoice_number", "tax_amount", "total", "created_at", "updated_at"]
