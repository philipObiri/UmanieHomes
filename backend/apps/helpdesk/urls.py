from django.urls import path
from .views import (
    TicketListView, TicketDetailView, TicketMessageView,
    ChatSessionCreateView, ChatSessionDetailView, AgentChatSessionsView,
)

urlpatterns = [
    path("tickets/", TicketListView.as_view(), name="ticket-list"),
    path("tickets/<int:pk>/", TicketDetailView.as_view(), name="ticket-detail"),
    path("tickets/<int:pk>/messages/", TicketMessageView.as_view(), name="ticket-messages"),
    path("chat/sessions/", ChatSessionCreateView.as_view(), name="chat-session-create"),
    path("chat/sessions/active/", AgentChatSessionsView.as_view(), name="chat-sessions-active"),
    path("chat/sessions/<str:session_key>/", ChatSessionDetailView.as_view(), name="chat-session-detail"),
]
