from rest_framework import serializers
from .models import Ticket, TicketMessage, ChatSession, ChatMessage


class TicketMessageSerializer(serializers.ModelSerializer):
    author_display = serializers.SerializerMethodField()

    class Meta:
        model = TicketMessage
        exclude = ["tenant"]
        read_only_fields = ["id", "author", "created_at"]

    def get_author_display(self, obj):
        if obj.author:
            return obj.author.get_full_name()
        return obj.author_name


class TicketListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.get_full_name", read_only=True)
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        exclude = ["tenant"]
        read_only_fields = ["id", "reference_number", "created_at", "updated_at", "resolved_at"]

    def get_messages_count(self, obj):
        return obj.messages.count()


class TicketDetailSerializer(TicketListSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "sender", "sender_name", "message", "is_from_agent", "timestamp", "read_at"]
        read_only_fields = ["id", "timestamp"]


class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)

    class Meta:
        model = ChatSession
        exclude = ["tenant"]
        read_only_fields = ["id", "session_key", "created_at", "ended_at"]
