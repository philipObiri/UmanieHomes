from django.contrib import admin
from .models import Lead, LeadNote, TourSchedule, Client


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "status", "priority", "source", "assigned_agent", "tenant", "created_at"]
    list_filter = ["status", "priority", "source", "tenant"]
    search_fields = ["name", "email", "phone"]
    list_editable = ["status", "priority"]


@admin.register(TourSchedule)
class TourScheduleAdmin(admin.ModelAdmin):
    list_display = ["lead", "property", "agent", "scheduled_at", "status"]
    list_filter = ["status", "tenant"]


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "assigned_agent", "tenant"]
    search_fields = ["name", "email"]
