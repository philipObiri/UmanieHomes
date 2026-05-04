from django.contrib import admin
from .models import ThemeConfig


@admin.register(ThemeConfig)
class ThemeConfigAdmin(admin.ModelAdmin):
    list_display = ["tenant", "primary_color", "accent_color", "font_family_heading", "updated_at"]
    search_fields = ["tenant__name"]
