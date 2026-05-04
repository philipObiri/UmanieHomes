from django.contrib import admin
from .models import PropertyView, PageView


@admin.register(PropertyView)
class PropertyViewAdmin(admin.ModelAdmin):
    list_display = ["property", "tenant", "ip_address", "created_at"]
    list_filter = ["tenant"]
    readonly_fields = ["property", "tenant", "ip_address", "user", "created_at"]
