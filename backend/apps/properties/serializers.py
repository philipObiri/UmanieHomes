from rest_framework import serializers
from .models import Property, PropertyImage, Inquiry


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "image", "image_url", "caption", "is_primary", "order"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class AgentSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField()
    phone = serializers.CharField(allow_null=True)
    avatar = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_avatar(self, obj):
        if obj.avatar:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None


class PropertyListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    property_type_display = serializers.SerializerMethodField()
    assigned_agent = serializers.SerializerMethodField()
    images = PropertyImageSerializer(many=True, read_only=True)
    price_display = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id", "reference_id", "title", "slug", "property_type", "property_type_display",
            "listing_type", "status", "status_display", "price", "currency", "price_display",
            "price_negotiable", "bedrooms", "bathrooms", "sqft", "area_sqm", "parking_spaces",
            "address", "city", "area", "country",
            "is_featured", "is_published", "primary_image", "images",
            "assigned_agent", "views_count", "inquiry_count", "created_at",
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img and img.image:
            request = self.context.get("request")
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_property_type_display(self, obj):
        return obj.get_property_type_display()

    def get_assigned_agent(self, obj):
        if obj.assigned_agent:
            return AgentSummarySerializer(obj.assigned_agent, context=self.context).data
        return None

    def get_price_display(self, obj):
        return f"{obj.currency} {obj.price:,.0f}"


class PropertyDetailSerializer(PropertyListSerializer):
    class Meta(PropertyListSerializer.Meta):
        fields = PropertyListSerializer.Meta.fields + [
            "description", "features", "toilets", "boys_quarters", "floors",
            "year_built", "energy_class", "energy_performance_index",
            "latitude", "longitude", "virtual_tour_url",
            "rental_period", "region", "updated_at",
        ]


class PropertyWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        exclude = ["tenant", "slug", "reference_id", "created_by", "views_count", "inquiry_count"]


class InquirySerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)

    class Meta:
        model = Inquiry
        exclude = ["tenant", "is_processed"]
        read_only_fields = ["id", "created_at"]
