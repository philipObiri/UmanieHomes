from rest_framework import serializers
from .models import Category, Tag, MediaFile, Page, BlogPost, Testimonial, TeamMember, FAQ


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "color", "created_at"]
        read_only_fields = ["id", "created_at"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]
        read_only_fields = ["id"]


class MediaFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source="uploaded_by.get_full_name", read_only=True)

    class Meta:
        model = MediaFile
        fields = ["id", "file", "url", "file_type", "name", "alt_text", "size",
                  "uploaded_by", "uploaded_by_name", "created_at"]
        read_only_fields = ["id", "size", "uploaded_by", "created_at"]

    def get_url(self, obj):
        request = self.context.get("request")
        if obj.file:
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None

    def create(self, validated_data):
        file = validated_data.get("file")
        if file:
            validated_data["size"] = file.size
            validated_data["name"] = validated_data.get("name") or file.name
            ext = file.name.rsplit(".", 1)[-1].lower()
            if ext in ("jpg", "jpeg", "png", "gif", "webp", "svg"):
                validated_data["file_type"] = MediaFile.TYPE_IMAGE
            elif ext in ("pdf", "doc", "docx", "xls", "xlsx"):
                validated_data["file_type"] = MediaFile.TYPE_DOCUMENT
            else:
                validated_data["file_type"] = MediaFile.TYPE_VIDEO
        return super().create(validated_data)


class PageSerializer(serializers.ModelSerializer):
    og_image_url = serializers.SerializerMethodField()
    updated_by_name = serializers.CharField(source="updated_by.get_full_name", read_only=True)

    class Meta:
        model = Page
        exclude = ["tenant"]
        read_only_fields = ["id", "created_at", "updated_at", "published_at"]

    def get_og_image_url(self, obj):
        if obj.og_image and obj.og_image.file:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.og_image.file.url) if request else obj.og_image.file.url
        return None


class BlogPostListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)
    featured_image_url = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "featured_image_url",
            "author", "author_name", "category", "tags",
            "is_published", "is_featured", "published_at",
            "read_time_minutes", "views_count", "created_at",
        ]

    def get_featured_image_url(self, obj):
        if obj.featured_image and obj.featured_image.file:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.featured_image.file.url) if request else obj.featured_image.file.url
        return None


class BlogPostDetailSerializer(BlogPostListSerializer):
    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ["content", "meta_title", "meta_description", "updated_at"]


class TestimonialSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        exclude = ["tenant"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_photo_url(self, obj):
        if obj.photo and obj.photo.file:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.photo.file.url) if request else obj.photo.file.url
        return None


class TeamMemberSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        exclude = ["tenant"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_photo_url(self, obj):
        if obj.photo and obj.photo.file:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.photo.file.url) if request else obj.photo.file.url
        return None


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        exclude = ["tenant"]
        read_only_fields = ["id", "created_at", "updated_at"]
