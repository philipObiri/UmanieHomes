from django.db import models
from django.utils.text import slugify
from core.models import TenantAwareModel
from core.utils import make_media_upload_path


class Category(TenantAwareModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#004274")

    class Meta:
        unique_together = [("tenant", "slug")]
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Tag(TenantAwareModel):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50)

    class Meta:
        unique_together = [("tenant", "slug")]
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class MediaFile(TenantAwareModel):
    TYPE_IMAGE = "image"
    TYPE_DOCUMENT = "document"
    TYPE_VIDEO = "video"

    TYPE_CHOICES = [
        (TYPE_IMAGE, "Image"),
        (TYPE_DOCUMENT, "Document"),
        (TYPE_VIDEO, "Video"),
    ]

    file = models.FileField(upload_to=make_media_upload_path)
    file_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_IMAGE)
    name = models.CharField(max_length=255)
    alt_text = models.CharField(max_length=255, blank=True)
    size = models.PositiveBigIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="uploaded_files"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def url(self):
        return self.file.url if self.file else ""


class Page(TenantAwareModel):
    PAGE_TYPE_HOME = "home"
    PAGE_TYPE_ABOUT = "about"
    PAGE_TYPE_CONTACT = "contact"
    PAGE_TYPE_CUSTOM = "custom"

    PAGE_TYPE_CHOICES = [
        (PAGE_TYPE_HOME, "Home"),
        (PAGE_TYPE_ABOUT, "About"),
        (PAGE_TYPE_CONTACT, "Contact"),
        (PAGE_TYPE_CUSTOM, "Custom"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200)
    page_type = models.CharField(max_length=20, choices=PAGE_TYPE_CHOICES, default=PAGE_TYPE_CUSTOM)
    content = models.JSONField(default=dict)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    og_image = models.ForeignKey(
        MediaFile, on_delete=models.SET_NULL, null=True, blank=True, related_name="og_pages"
    )
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        unique_together = [("tenant", "slug")]
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} ({self.tenant.name})"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        from django.utils import timezone
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class BlogPost(TenantAwareModel):
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=300)
    excerpt = models.TextField(blank=True)
    content = models.JSONField(default=dict)
    featured_image = models.ForeignKey(
        MediaFile, on_delete=models.SET_NULL, null=True, blank=True, related_name="blog_featured"
    )
    author = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="blog_posts"
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="posts"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="posts")
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    read_time_minutes = models.PositiveIntegerField(default=5)
    views_count = models.PositiveIntegerField(default=0)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)

    class Meta:
        unique_together = [("tenant", "slug")]
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["tenant", "is_published", "-published_at"]),
            models.Index(fields=["tenant", "is_featured"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        from django.utils import timezone
        if self.is_published and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class Testimonial(TenantAwareModel):
    name = models.CharField(max_length=150)
    title = models.CharField(max_length=200, blank=True)
    quote = models.TextField()
    rating = models.PositiveSmallIntegerField(default=5)
    photo = models.ForeignKey(
        MediaFile, on_delete=models.SET_NULL, null=True, blank=True, related_name="testimonials"
    )
    location = models.CharField(max_length=150, blank=True)
    is_featured = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return f"{self.name} — {self.rating}★"


class TeamMember(TenantAwareModel):
    name = models.CharField(max_length=150)
    title = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    photo = models.ForeignKey(
        MediaFile, on_delete=models.SET_NULL, null=True, blank=True, related_name="team_photos"
    )
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=100, blank=True)
    specialties = models.JSONField(default=list)
    years_experience = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=True)

    # Social
    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} — {self.title}"


class FAQ(TenantAwareModel):
    CATEGORY_BUYING = "buying"
    CATEGORY_SELLING = "selling"
    CATEGORY_RENTING = "renting"
    CATEGORY_FINANCING = "financing"
    CATEGORY_GENERAL = "general"

    CATEGORY_CHOICES = [
        (CATEGORY_BUYING, "Buying"),
        (CATEGORY_SELLING, "Selling"),
        (CATEGORY_RENTING, "Renting"),
        (CATEGORY_FINANCING, "Financing"),
        (CATEGORY_GENERAL, "General"),
    ]

    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default=CATEGORY_GENERAL)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["category", "order"]

    def __str__(self):
        return self.question[:80]
