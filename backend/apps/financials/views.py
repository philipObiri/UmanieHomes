from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsTenantManager, IsTenantAdmin
from core.pagination import StandardPagination
from .models import Deal, Commission, Invoice
from .serializers import DealSerializer, CommissionSerializer, InvoiceSerializer


class DealListView(generics.ListCreateAPIView):
    permission_classes = [IsTenantManager]
    serializer_class = DealSerializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "deal_type", "agent", "currency"]
    search_fields = ["reference", "client__name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Deal.objects.filter(tenant=self.request.tenant).select_related("agent", "property", "client")

    def perform_create(self, serializer):
        deal = serializer.save(tenant=self.request.tenant)
        if deal.status == "closed":
            Commission.objects.create(
                tenant=self.request.tenant,
                deal=deal,
                agent=deal.agent,
                amount=deal.commission_amount,
                currency=deal.currency,
                rate=deal.commission_rate,
            )


class DealDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsTenantManager]
    serializer_class = DealSerializer

    def get_queryset(self):
        return Deal.objects.filter(tenant=self.request.tenant)


class CommissionListView(generics.ListAPIView):
    permission_classes = [IsTenantManager]
    serializer_class = CommissionSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "agent"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Commission.objects.filter(tenant=self.request.tenant).select_related("agent", "deal")


class InvoiceListView(generics.ListCreateAPIView):
    permission_classes = [IsTenantAdmin]
    serializer_class = InvoiceSerializer
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "currency"]
    search_fields = ["invoice_number", "client_name", "client_email"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Invoice.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant, issued_by=self.request.user)


class InvoicePDFView(APIView):
    permission_classes = [IsTenantAdmin]

    def get(self, request, pk):
        try:
            invoice = Invoice.objects.get(pk=pk, tenant=request.tenant)
        except Invoice.DoesNotExist:
            return Response({"detail": "Invoice not found."}, status=404)

        try:
            from weasyprint import HTML
            from django.template.loader import render_to_string
            html_content = render_to_string("financials/invoice_pdf.html", {
                "invoice": invoice,
                "tenant": request.tenant,
            })
            pdf = HTML(string=html_content).write_pdf()
            response = HttpResponse(pdf, content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="invoice-{invoice.invoice_number}.pdf"'
            return response
        except Exception as e:
            return Response({"detail": f"PDF generation failed: {str(e)}"}, status=500)
