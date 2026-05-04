from rest_framework import serializers
from .models import ThemeConfig


class ThemeConfigSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    logo_dark_url = serializers.SerializerMethodField()
    favicon_url = serializers.SerializerMethodField()
    css_vars = serializers.SerializerMethodField()

    class Meta:
        model = ThemeConfig
        exclude = ["tenant"]

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if obj.logo:
            return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url
        return None

    def get_logo_dark_url(self, obj):
        request = self.context.get("request")
        if obj.logo_dark:
            return request.build_absolute_uri(obj.logo_dark.url) if request else obj.logo_dark.url
        return None

    def get_favicon_url(self, obj):
        request = self.context.get("request")
        if obj.favicon:
            return request.build_absolute_uri(obj.favicon.url) if request else obj.favicon.url
        return None

    def get_css_vars(self, obj):
        return obj.to_css_vars()
