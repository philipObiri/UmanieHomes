import django_filters
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    min_bedrooms = django_filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    min_bathrooms = django_filters.NumberFilter(field_name="bathrooms", lookup_expr="gte")
    city = django_filters.CharFilter(lookup_expr="iexact")
    country = django_filters.CharFilter(lookup_expr="iexact")
    has_pool = django_filters.BooleanFilter(method="filter_feature")
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Property
        fields = [
            "property_type", "listing_type", "status", "currency",
            "city", "country", "is_featured", "is_published",
            "min_price", "max_price", "min_bedrooms", "min_bathrooms",
            "boys_quarters",
        ]

    def filter_feature(self, queryset, name, value):
        if value:
            return queryset.filter(features__contains=["Pool"])
        return queryset
