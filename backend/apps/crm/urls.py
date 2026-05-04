from django.urls import path
from .views import LeadListView, LeadDetailView, LeadNoteView, TourListView, ClientListView

urlpatterns = [
    path("leads/", LeadListView.as_view(), name="lead-list"),
    path("leads/<int:pk>/", LeadDetailView.as_view(), name="lead-detail"),
    path("leads/<int:pk>/notes/", LeadNoteView.as_view(), name="lead-notes"),
    path("tours/", TourListView.as_view(), name="tour-list"),
    path("clients/", ClientListView.as_view(), name="client-list"),
]
