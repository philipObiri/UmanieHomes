from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsTenantAgent, IsTenantManager
from core.pagination import StandardPagination
from .models import Lead, LeadNote, TourSchedule, Client
from .serializers import LeadListSerializer, LeadDetailSerializer, LeadNoteSerializer, TourScheduleSerializer, ClientSerializer


class LeadListView(generics.ListCreateAPIView):
    permission_classes = [IsTenantAgent]
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "priority", "source", "assigned_agent"]
    search_fields = ["name", "email", "phone"]
    ordering_fields = ["created_at", "priority", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        tenant = self.request.tenant
        if not tenant:
            return Lead.objects.none()
        qs = Lead.objects.filter(tenant=tenant).select_related("assigned_agent", "property")
        # Agents only see their own leads
        user = self.request.user
        if user.get_role_for_tenant(tenant) == "agent":
            qs = qs.filter(assigned_agent=user)
        return qs

    def get_serializer_class(self):
        return LeadDetailSerializer if self.request.method == "GET" else LeadListSerializer

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


class LeadDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsTenantAgent]

    def get_queryset(self):
        return Lead.objects.filter(tenant=self.request.tenant)

    def get_serializer_class(self):
        return LeadDetailSerializer if self.request.method == "GET" else LeadListSerializer


class LeadNoteView(generics.ListCreateAPIView):
    permission_classes = [IsTenantAgent]

    def get_queryset(self):
        return LeadNote.objects.filter(
            tenant=self.request.tenant, lead_id=self.kwargs["pk"]
        )

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant, lead_id=self.kwargs["pk"], author=self.request.user)

    def get_serializer_class(self):
        return LeadNoteSerializer


class TourListView(generics.ListCreateAPIView):
    permission_classes = [IsTenantAgent]
    serializer_class = TourScheduleSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "agent"]
    ordering = ["-scheduled_at"]

    def get_queryset(self):
        tenant = self.request.tenant
        if not tenant:
            return TourSchedule.objects.none()
        qs = TourSchedule.objects.filter(tenant=tenant).select_related("lead", "property", "agent")
        user = self.request.user
        if user.get_role_for_tenant(tenant) == "agent":
            qs = qs.filter(agent=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)


class ClientListView(generics.ListCreateAPIView):
    permission_classes = [IsTenantManager]
    serializer_class = ClientSerializer
    pagination_class = StandardPagination
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ["name", "email", "phone"]
    filterset_fields = ["assigned_agent"]

    def get_queryset(self):
        return Client.objects.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        serializer.save(tenant=self.request.tenant)
