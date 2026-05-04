from django.urls import path
from .views import DealListView, DealDetailView, CommissionListView, InvoiceListView, InvoicePDFView

urlpatterns = [
    path("deals/", DealListView.as_view(), name="deal-list"),
    path("deals/<int:pk>/", DealDetailView.as_view(), name="deal-detail"),
    path("commissions/", CommissionListView.as_view(), name="commission-list"),
    path("invoices/", InvoiceListView.as_view(), name="invoice-list"),
    path("invoices/<int:pk>/pdf/", InvoicePDFView.as_view(), name="invoice-pdf"),
]
