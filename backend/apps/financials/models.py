from django.db import models
from core.models import TenantAwareModel
from core.utils import generate_reference


class Deal(TenantAwareModel):
    STATUS_PENDING = "pending"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_CLOSED = "closed"
    STATUS_LOST = "lost"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_CLOSED, "Closed"),
        (STATUS_LOST, "Lost"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    TYPE_SALE = "sale"
    TYPE_RENTAL = "rental"
    TYPE_REFERRAL = "referral"

    TYPE_CHOICES = [
        (TYPE_SALE, "Sale"),
        (TYPE_RENTAL, "Rental"),
        (TYPE_REFERRAL, "Referral"),
    ]

    reference = models.CharField(max_length=20, unique=True, blank=True)
    property = models.ForeignKey(
        "properties.Property", on_delete=models.SET_NULL, null=True, related_name="deals"
    )
    client = models.ForeignKey(
        "crm.Client", on_delete=models.SET_NULL, null=True, blank=True, related_name="deals"
    )
    lead = models.ForeignKey(
        "crm.Lead", on_delete=models.SET_NULL, null=True, blank=True, related_name="deals"
    )
    agent = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="deals"
    )
    deal_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=TYPE_SALE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    deal_value = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=5, default="USD")
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["tenant", "status"]),
            models.Index(fields=["tenant", "agent"]),
        ]

    def __str__(self):
        return f"{self.reference} — {self.deal_type} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = generate_reference(prefix="DEAL", length=6)
        self.commission_amount = self.deal_value * (self.commission_rate / 100)
        from django.utils import timezone
        if self.status == self.STATUS_CLOSED and not self.closed_at:
            self.closed_at = timezone.now()
        super().save(*args, **kwargs)


class Commission(TenantAwareModel):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_PAID = "paid"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_PAID, "Paid"),
    ]

    deal = models.OneToOneField(Deal, on_delete=models.CASCADE, related_name="commission")
    agent = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, related_name="commissions")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=5, default="USD")
    rate = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    approved_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_commissions"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Commission for {self.deal.reference} — {self.agent.get_full_name() if self.agent else 'N/A'}"


class Invoice(TenantAwareModel):
    STATUS_DRAFT = "draft"
    STATUS_SENT = "sent"
    STATUS_PAID = "paid"
    STATUS_OVERDUE = "overdue"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_SENT, "Sent"),
        (STATUS_PAID, "Paid"),
        (STATUS_OVERDUE, "Overdue"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    invoice_number = models.CharField(max_length=30, unique=True, blank=True)
    deal = models.ForeignKey(Deal, on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")
    client_name = models.CharField(max_length=200)
    client_email = models.EmailField(blank=True)
    client_address = models.TextField(blank=True)
    line_items = models.JSONField(default=list)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.CharField(max_length=5, default="USD")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    due_date = models.DateField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    issued_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="issued_invoices"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice #{self.invoice_number} — {self.client_name}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = generate_reference(prefix="INV", length=6)
        self.tax_amount = self.subtotal * (self.tax_rate / 100)
        self.total = self.subtotal + self.tax_amount
        super().save(*args, **kwargs)
