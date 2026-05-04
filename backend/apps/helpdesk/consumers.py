import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_key = self.scope["url_route"]["kwargs"]["session_key"]
        self.group_name = f"chat_{self.session_key}"

        session = await self.get_session()
        if not session or session.status == "closed":
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Notify group that someone connected
        user = self.scope.get("user")
        is_agent = user and user.is_authenticated and hasattr(user, "tenant_roles")
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "presence",
                "event": "connected",
                "name": user.get_full_name() if (user and user.is_authenticated) else "Visitor",
                "is_agent": is_agent,
            },
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type", "message")

        if msg_type == "message":
            user = self.scope.get("user")
            is_agent = user and user.is_authenticated
            sender_name = data.get("sender_name", "Visitor")
            if user and user.is_authenticated:
                sender_name = user.get_full_name()

            message = data.get("message", "").strip()
            if not message:
                return

            saved_msg = await self.save_message(
                session_key=self.session_key,
                user=user if (user and user.is_authenticated) else None,
                sender_name=sender_name,
                message=message,
                is_from_agent=is_agent,
            )

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "id": saved_msg.id,
                    "message": message,
                    "sender_name": sender_name,
                    "is_from_agent": is_agent,
                    "timestamp": saved_msg.timestamp.isoformat(),
                },
            )

        elif msg_type == "typing":
            user = self.scope.get("user")
            name = user.get_full_name() if (user and user.is_authenticated) else "Visitor"
            await self.channel_layer.group_send(
                self.group_name,
                {"type": "typing_indicator", "name": name, "is_typing": data.get("is_typing", True)},
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({"type": "message", **event}))

    async def presence(self, event):
        await self.send(text_data=json.dumps({"type": "presence", **event}))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({"type": "typing", **event}))

    @database_sync_to_async
    def get_session(self):
        from .models import ChatSession
        try:
            return ChatSession.objects.get(session_key=self.session_key)
        except ChatSession.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, session_key, user, sender_name, message, is_from_agent):
        from .models import ChatSession, ChatMessage
        session = ChatSession.objects.get(session_key=session_key)
        return ChatMessage.objects.create(
            session=session,
            sender=user,
            sender_name=sender_name,
            message=message,
            is_from_agent=is_from_agent,
        )
