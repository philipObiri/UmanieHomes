from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from core.permissions import IsTenantMember
from core.pagination import SmallPagination
from .models import Notification, PushSubscription
from .serializers import NotificationSerializer, PushSubscriptionSerializer


class NotificationListView(generics.ListAPIView):
    permission_classes = [IsTenantMember]
    serializer_class = NotificationSerializer
    pagination_class = SmallPagination

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class MarkReadView(APIView):
    permission_classes = [IsTenantMember]

    def post(self, request):
        ids = request.data.get("ids", [])
        if ids:
            Notification.objects.filter(
                recipient=request.user, id__in=ids, is_read=False
            ).update(is_read=True, read_at=timezone.now())
        else:
            Notification.objects.filter(recipient=request.user, is_read=False).update(
                is_read=True, read_at=timezone.now()
            )
        return Response({"detail": "Marked as read."})


class PushSubscriptionView(generics.CreateAPIView):
    serializer_class = PushSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        # Validate all fields except the unique endpoint constraint (we upsert)
        serializer.is_valid(raise_exception=True)
        PushSubscription.objects.update_or_create(
            user=request.user,
            endpoint=serializer.validated_data["endpoint"],
            defaults={
                "p256dh": serializer.validated_data["p256dh"],
                "auth": serializer.validated_data["auth"],
            },
        )
        return Response({"detail": "Subscription saved."}, status=status.HTTP_201_CREATED)
