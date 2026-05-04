from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.permissions import IsTenantSupport, IsTenantMember
from core.pagination import StandardPagination
from .models import Ticket, TicketMessage, ChatSession
from .serializers import (
    TicketListSerializer, TicketDetailSerializer, TicketMessageSerializer,
    ChatSessionSerializer,
)


class TicketListView(generics.ListCreateAPIView):
    permission_classes = [IsTenantMember]
    pagination_class = StandardPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "priority", "assigned_to"]
    search_fields = ["subject", "reference_number", "client_email"]
    ordering = ["-created_at"]

    def get_queryset(self):
        tenant = self.request.tenant
        if not tenant:
            return Ticket.objects.none()
        qs = Ticket.objects.filter(tenant=tenant).select_related("assigned_to", "client")
        user = self.request.user
        role = user.get_role_for_tenant(tenant)
        if role == "client":
            qs = qs.filter(client=user)
        return qs

    def get_serializer_class(self):
        return TicketDetailSerializer if self.request.method == "GET" else TicketListSerializer

    def perform_create(self, serializer):
        user = self.request.user
        ticket = serializer.save(
            tenant=self.request.tenant,
            client=user,
            client_name=user.get_full_name(),
            client_email=user.email,
        )
        try:
            from apps.notifications.tasks import send_new_ticket_notification
            send_new_ticket_notification.delay(ticket.id)
        except Exception:
            pass


class TicketDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsTenantSupport]
    serializer_class = TicketDetailSerializer

    def get_queryset(self):
        return Ticket.objects.filter(tenant=self.request.tenant)

    def get_serializer_class(self):
        return TicketDetailSerializer if self.request.method == "GET" else TicketListSerializer


class TicketMessageView(generics.ListCreateAPIView):
    permission_classes = [IsTenantMember]
    serializer_class = TicketMessageSerializer

    def get_queryset(self):
        return TicketMessage.objects.filter(
            tenant=self.request.tenant, ticket_id=self.kwargs["pk"]
        )

    def perform_create(self, serializer):
        ticket = Ticket.objects.get(pk=self.kwargs["pk"], tenant=self.request.tenant)
        user = self.request.user
        role = user.get_role_for_tenant(self.request.tenant)
        is_internal = self.request.data.get("is_internal", False) and role in ("admin", "manager", "support")
        serializer.save(
            tenant=self.request.tenant,
            ticket=ticket,
            author=user,
            author_name=user.get_full_name(),
            is_internal=is_internal,
        )


class ChatSessionCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tenant = getattr(request, "tenant", None)
        if not tenant:
            return Response({"detail": "No tenant context."}, status=400)

        name = request.data.get("name", "Visitor")
        email = request.data.get("email", "")

        # Create chat session and auto-create a ticket
        ticket = Ticket.objects.create(
            tenant=tenant,
            subject=f"Live Chat from {name}",
            description=f"Live chat session initiated by {name} ({email})",
            client_name=name,
            client_email=email,
            priority=Ticket.PRIORITY_MEDIUM,
        )

        session = ChatSession.objects.create(
            tenant=tenant,
            client_name=name,
            client_email=email,
            ticket=ticket,
        )

        return Response({
            "session_key": str(session.session_key),
            "ticket_reference": ticket.reference_number,
        }, status=status.HTTP_201_CREATED)


class ChatSessionDetailView(APIView):
    permission_classes = [IsTenantSupport]

    def get(self, request, session_key):
        try:
            session = ChatSession.objects.get(session_key=session_key, tenant=request.tenant)
        except ChatSession.DoesNotExist:
            return Response({"detail": "Session not found."}, status=404)
        return Response(ChatSessionSerializer(session).data)


class AgentChatSessionsView(generics.ListAPIView):
    """Lists all active chat sessions for agents."""
    permission_classes = [IsTenantSupport]
    serializer_class = ChatSessionSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(
            tenant=self.request.tenant, status=ChatSession.STATUS_ACTIVE
        ).select_related("agent", "ticket").prefetch_related("messages")
