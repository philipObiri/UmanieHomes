from django.db import models
from core.models import TimestampedModel
from core.utils import make_logo_upload_path


GOOGLE_FONTS = [
    ("Inter", "Inter"),
    ("Poppins", "Poppins"),
    ("Roboto", "Roboto"),
    ("Lato", "Lato"),
    ("Open Sans", "Open Sans"),
    ("Montserrat", "Montserrat"),
    ("Raleway", "Raleway"),
    ("Nunito", "Nunito"),
    ("Playfair Display", "Playfair Display"),
    ("Merriweather", "Merriweather"),
    ("Source Sans Pro", "Source Sans Pro"),
    ("Oswald", "Oswald"),
]


class ThemeConfig(TimestampedModel):
    tenant = models.OneToOneField(
        "tenants.Tenant", on_delete=models.CASCADE, related_name="theme_config"
    )

    # Brand assets
    logo = models.ImageField(upload_to=make_logo_upload_path, null=True, blank=True)
    logo_dark = models.ImageField(upload_to=make_logo_upload_path, null=True, blank=True)
    favicon = models.ImageField(upload_to=make_logo_upload_path, null=True, blank=True)

    # Color palette
    primary_color = models.CharField(max_length=7, default="#004274")
    secondary_color = models.CharField(max_length=7, default="#0A1F44")
    accent_color = models.CharField(max_length=7, default="#C9A974")
    background_color = models.CharField(max_length=7, default="#FFFFFF")
    surface_color = models.CharField(max_length=7, default="#F9FAFB")
    text_primary_color = models.CharField(max_length=7, default="#111827")
    text_secondary_color = models.CharField(max_length=7, default="#4B5563")
    nav_background = models.CharField(max_length=7, default="#FFFFFF")
    footer_background = models.CharField(max_length=7, default="#0A1F44")
    footer_text_color = models.CharField(max_length=7, default="#FFFFFF")
    border_color = models.CharField(max_length=7, default="#E5E7EB")
    success_color = models.CharField(max_length=7, default="#10B981")
    warning_color = models.CharField(max_length=7, default="#F59E0B")
    error_color = models.CharField(max_length=7, default="#EF4444")

    # Dark mode colors
    dark_bg_color = models.CharField(max_length=7, default="#0B1220")
    dark_surface_color = models.CharField(max_length=7, default="#161F30")
    dark_text_primary = models.CharField(max_length=7, default="#F9FAFB")
    dark_border_color = models.CharField(max_length=7, default="#1F2937")

    # Typography
    font_family_heading = models.CharField(max_length=50, choices=GOOGLE_FONTS, default="Inter")
    font_family_body = models.CharField(max_length=50, choices=GOOGLE_FONTS, default="Inter")
    font_size_base = models.FloatField(default=16.0)
    font_weight_heading = models.CharField(max_length=10, default="700")

    # Layout
    border_radius_base = models.FloatField(default=8.0)
    nav_style = models.CharField(
        max_length=20,
        choices=[("fixed", "Fixed"), ("sticky", "Sticky"), ("static", "Static")],
        default="fixed",
    )
    dark_mode_enabled = models.BooleanField(default=True)

    # Custom CSS override (injected after theme vars)
    custom_css = models.TextField(blank=True)

    class Meta:
        verbose_name = "Theme Config"

    def __str__(self):
        return f"Theme for {self.tenant.name}"

    def to_css_vars(self):
        """Returns a dict of CSS variable name → value for injection into :root."""
        return {
            "--primary": self.primary_color,
            "--secondary": self.secondary_color,
            "--accent": self.accent_color,
            "--bg": self.background_color,
            "--surface": self.surface_color,
            "--text-primary": self.text_primary_color,
            "--text-secondary": self.text_secondary_color,
            "--nav-bg": self.nav_background,
            "--footer-bg": self.footer_background,
            "--footer-text": self.footer_text_color,
            "--border": self.border_color,
            "--success": self.success_color,
            "--warning": self.warning_color,
            "--error": self.error_color,
            "--font-heading": self.font_family_heading,
            "--font-body": self.font_family_body,
            "--font-size-base": f"{self.font_size_base}px",
            "--radius": f"{self.border_radius_base}px",
            "--dark-bg": self.dark_bg_color,
            "--dark-surface": self.dark_surface_color,
            "--dark-text": self.dark_text_primary,
            "--dark-border": self.dark_border_color,
        }
