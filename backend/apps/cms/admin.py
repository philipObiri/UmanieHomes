from django.contrib import admin
from .models import Category, Tag, MediaFile, Page, BlogPost, Testimonial, TeamMember, FAQ


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "tenant", "color"]
    list_filter = ["tenant"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ["name", "file_type", "tenant", "uploaded_by", "created_at"]
    list_filter = ["file_type", "tenant"]
    search_fields = ["name"]


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "page_type", "tenant", "is_published", "updated_at"]
    list_filter = ["page_type", "is_published", "tenant"]
    search_fields = ["title", "slug"]


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "author", "category", "tenant", "is_published", "is_featured", "views_count"]
    list_filter = ["is_published", "is_featured", "category", "tenant"]
    search_fields = ["title", "slug"]
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ["name", "rating", "tenant", "is_featured", "order"]
    list_filter = ["tenant", "is_featured"]


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ["name", "title", "tenant", "is_featured", "order"]
    list_filter = ["tenant", "is_featured"]


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ["question", "category", "tenant", "is_published", "order"]
    list_filter = ["category", "tenant"]
