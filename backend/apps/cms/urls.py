from django.urls import path
from .views import (
    CategoryListView, CategoryDetailView, TagListView,
    MediaListView, MediaDetailView,
    PageListView, PageDetailView,
    BlogPostListView, BlogPostDetailView,
    TestimonialListView, TestimonialDetailView,
    TeamMemberListView, TeamMemberDetailView,
    FAQListView,
)

urlpatterns = [
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<slug:slug>/", CategoryDetailView.as_view(), name="category-detail"),
    path("tags/", TagListView.as_view(), name="tag-list"),
    path("media/", MediaListView.as_view(), name="media-list"),
    path("media/<int:pk>/", MediaDetailView.as_view(), name="media-detail"),
    path("pages/", PageListView.as_view(), name="page-list"),
    path("pages/<slug:slug>/", PageDetailView.as_view(), name="page-detail"),
    path("posts/", BlogPostListView.as_view(), name="post-list"),
    path("posts/<slug:slug>/", BlogPostDetailView.as_view(), name="post-detail"),
    path("testimonials/", TestimonialListView.as_view(), name="testimonial-list"),
    path("testimonials/<int:pk>/", TestimonialDetailView.as_view(), name="testimonial-detail"),
    path("team/", TeamMemberListView.as_view(), name="team-list"),
    path("team/<int:pk>/", TeamMemberDetailView.as_view(), name="team-detail"),
    path("faqs/", FAQListView.as_view(), name="faq-list"),
]
