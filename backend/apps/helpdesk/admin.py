from django.contrib import admin
from .models import Ticket, TicketMessage, ChatSession, ChatMessage


class TicketMessageInline(admin.TabularInline):
    model = TicketMessage
    extra = 0
    readonly_fields = ["author", "created_at"]


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ["reference_number", "subject", "status", "priority", "assigned_to", "tenant", "created_at"]
    list_filter = ["status", "priority", "tenant"]
    search_fields = ["reference_number", "subject", "client_email"]
    list_editable = ["status", "priority"]
    inlines = [TicketMessageInline]


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ["session_key", "client_name", "agent", "status", "tenant", "created_at"]
    list_filter = ["status", "tenant"]
