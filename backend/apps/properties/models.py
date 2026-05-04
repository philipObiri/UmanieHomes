from django.db import models
from django.utils.text import slugify
from core.models import TenantAwareModel
from core.utils import make_property_upload_path


class Property(TenantAwareModel):
    TYPE_VILLA = "villa"
    TYPE_BUNGALOW = "bungalow"
    TYPE_DUPLEX = "duplex"
    TYPE_PENTHOUSE = "penthouse"
    TYPE_APARTMENT = "apartment"
    TYPE_MANSION = "mansion"
    TYPE_ESTATE = "estate"
    TYPE_TOWNHOUSE = "townhouse"
    TYPE_COMMERCIAL = "commercial"
    TYPE_LAND = "land"

    TYPE_CHOICES = [
        (TYPE_VILLA, "Villa"),
        (TYPE_BUNGALOW, "Bungalow"),
        (TYPE_DUPLEX, "Duplex"),
        (TYPE_PENTHOUSE, "Penthouse"),
        (TYPE_APARTMENT, "Apartment"),
        (TYPE_MANSION, "Mansion"),
        (TYPE_ESTATE, "Estate"),
        (TYPE_TOWNHOUSE, "Townhouse"),
        (TYPE_COMMERCIAL, "Commercial"),
        (TYPE_LAND, "Land"),
    ]

    STATUS_AVAILABLE = "available"
    STATUS_SOLD = "sold"
    STATUS_RENTED = "rented"
    STATUS_PENDING = "pending"
    STATUS_OFF_MARKET = "off_market"

    STATUS_CHOICES = [
        (STATUS_AVAILABLE, "Available"),
        (STATUS_SOLD, "Sold"),
        (STATUS_RENTED, "Rented"),
        (STATUS_PENDING, "Pending"),
        (STATUS_OFF_MARKET, "Off Market"),
    ]

    LISTING_SALE = "sale"
    LISTING_RENT = "rent"
    LISTING_BOTH = "both"

    LISTING_TYPE_CHOICES = [
        (LISTING_SALE, "For Sale"),
        (LISTING_RENT, "For Rent"),
        (LISTING_BOTH, "Sale & Rent"),
    ]

    CURRENCY_USD = "USD"
    CURRENCY_GHS = "GHS"
    CURRENCY_NGN = "NGN"
    CURRENCY_KES = "KES"
    CURRENCY_ZAR = "ZAR"
    CURRENCY_EUR = "EUR"
    CURRENCY_GBP = "GBP"

    CURRENCY_CHOICES = [
        (CURRENCY_USD, "USD"),
        (CURRENCY_GHS, "GHS (Cedis)"),
        (CURRENCY_NGN, "NGN (Naira)"),
        (CURRENCY_KES, "KES (Shilling)"),
        (CURRENCY_ZAR, "ZAR (Rand)"),
        (CURRENCY_EUR, "EUR"),
        (CURRENCY_GBP, "GBP"),
    ]

    # Identity
    reference_id = models.CharField(max_length=50, blank=True, db_index=True)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300)
    description = models.TextField()

    # Classification
    property_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_BUNGALOW)
    listing_type = models.CharField(max_length=10, choices=LISTING_TYPE_CHOICES, default=LISTING_SALE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_AVAILABLE)

    # Pricing
    price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=5, choices=CURRENCY_CHOICES, default=CURRENCY_USD)
    price_negotiable = models.BooleanField(default=False)
    rental_period = models.CharField(max_length=20, blank=True)

    # Specs
    bedrooms = models.PositiveSmallIntegerField(default=0)
    bathrooms = models.PositiveSmallIntegerField(default=0)
    toilets = models.PositiveSmallIntegerField(default=0)
    sqft = models.PositiveIntegerField(default=0)
    area_sqm = models.FloatField(default=0)
    parking_spaces = models.PositiveSmallIntegerField(default=0)
    year_built = models.PositiveSmallIntegerField(null=True, blank=True)
    energy_class = models.CharField(max_length=5, blank=True)
    energy_performance_index = models.FloatField(null=True, blank=True)
    floors = models.PositiveSmallIntegerField(default=1)
    boys_quarters = models.BooleanField(default=False)

    # Location
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default="Ghana")
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Features / amenities stored as JSON list
    features = models.JSONField(default=list)

    # Assignment
    assigned_agent = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_properties"
    )
    created_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="created_properties"
    )

    # Flags
    is_featured = models.BooleanField(default=False, db_index=True)
    is_published = models.BooleanField(default=True)
    virtual_tour_url = models.URLField(blank=True)

    # Stats
    views_count = models.PositiveIntegerField(default=0)
    inquiry_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [("tenant", "slug")]
        ordering = ["-is_featured", "-created_at"]
        indexes = [
            models.Index(fields=["tenant", "status", "is_published"]),
            models.Index(fields=["tenant", "property_type"]),
            models.Index(fields=["tenant", "city"]),
            models.Index(fields=["tenant", "listing_type"]),
        ]

    def __str__(self):
        return f"{self.reference_id} — {self.title}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.reference_id:
            from core.utils import generate_reference
            self.reference_id = generate_reference(prefix="UMH")
        super().save(*args, **kwargs)


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to=make_property_upload_path)
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-is_primary"]

    def __str__(self):
        return f"Image for {self.property.title}"


class Inquiry(TenantAwareModel):
    """Submitted by public users on property detail pages — auto-creates a Lead."""
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="inquiries")
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    message = models.TextField()
    preferred_tour_date = models.DateField(null=True, blank=True)
    is_processed = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Inquiry from {self.name} on {self.property.title}"
