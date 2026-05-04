from django.urls import path
from .views import (
    PropertyListView, PropertyDetailView, FeaturedPropertiesView,
    PropertyImageView, PropertyImageDeleteView, InquireView,
)

urlpatterns = [
    path("listings/", PropertyListView.as_view(), name="property-list"),
    path("featured/", FeaturedPropertiesView.as_view(), name="property-featured"),
    path("listings/<slug:slug>/", PropertyDetailView.as_view(), name="property-detail"),
    path("listings/<int:pk>/", PropertyDetailView.as_view(), name="property-detail-pk"),
    path("listings/<int:pk>/images/", PropertyImageView.as_view(), name="property-images"),
    path("listings/<int:pk>/images/<int:img_pk>/", PropertyImageDeleteView.as_view(), name="property-image-delete"),
    path("listings/<int:pk>/inquire/", InquireView.as_view(), name="property-inquire"),
]
