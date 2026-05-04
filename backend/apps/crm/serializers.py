from rest_framework import serializers
from .models import Lead, LeadNote, TourSchedule, Client


class LeadNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)

    class Meta:
        model = LeadNote
        exclude = ["tenant"]
        read_only_fields = ["id", "author", "created_at"]


class TourScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TourSchedule
        exclude = ["tenant"]
        read_only_fields = ["id", "created_at"]


class LeadListSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="assigned_agent.get_full_name", read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    notes_count = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        exclude = ["tenant"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_notes_count(self, obj):
        return obj.notes.count()


class LeadDetailSerializer(LeadListSerializer):
    notes = LeadNoteSerializer(many=True, read_only=True)
    tours = TourScheduleSerializer(many=True, read_only=True)


class ClientSerializer(serializers.ModelSerializer):
    agent_name = serializers.CharField(source="assigned_agent.get_full_name", read_only=True)

    class Meta:
        model = Client
        exclude = ["tenant"]
        read_only_fields = ["id", "created_at", "updated_at"]
