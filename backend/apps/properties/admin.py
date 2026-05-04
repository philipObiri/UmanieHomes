from django.contrib import admin
from .models import Property, PropertyImage, Inquiry


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ["image", "caption", "is_primary", "order"]


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = [
        "reference_id", "title", "property_type", "status",
        "price", "currency", "city", "tenant", "is_featured", "is_published"
    ]
    list_filter = ["property_type", "status", "listing_type", "is_featured", "is_published", "tenant", "currency"]
    search_fields = ["title", "reference_id", "city", "address"]
    inlines = [PropertyImageInline]
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ["is_featured", "is_published", "status"]


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "property", "tenant", "is_processed", "created_at"]
    list_filter = ["is_processed", "tenant"]
    search_fields = ["name", "email"]
    list_editable = ["is_processed"]
