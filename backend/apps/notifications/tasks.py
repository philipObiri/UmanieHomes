import json
import base64
import logging
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

BRAND_GOLD = "#C49E56"
BRAND_DARK = "#0a1f44"
BRAND_NAME = "Umanie Homes Africa"
BRAND_SITE = "https://umaniehomesafrica.com"


def _base_html(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:{BRAND_DARK};padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">{BRAND_NAME}</p>
          <div style="width:40px;height:3px;background:{BRAND_GOLD};margin:10px auto 0;border-radius:2px;"></div>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:40px;">
          {body_html}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9f9f9;border-top:1px solid #eeeeee;padding:24px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#999999;">{BRAND_NAME} &mdash; Premium Real Estate Across Africa</p>
          <p style="margin:0;font-size:12px;color:#bbbbbb;">This is an automated message. Please do not reply directly to this email.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""


def _info_row(label: str, value: str) -> str:
    return f"""
    <tr>
      <td style="padding:8px 12px;font-size:13px;font-weight:600;color:#555555;width:130px;border-bottom:1px solid #f0f0f0;">{label}</td>
      <td style="padding:8px 12px;font-size:14px;color:#222222;border-bottom:1px solid #f0f0f0;">{value or '—'}</td>
    </tr>"""


def _info_table(rows: list[tuple]) -> str:
    rows_html = "".join(_info_row(k, v) for k, v in rows)
    return f'<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:8px;margin:20px 0;overflow:hidden;">{rows_html}</table>'


def _heading(text: str) -> str:
    return f"""
    <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:{BRAND_DARK};">{text}</h2>
    <div style="width:36px;height:3px;background:{BRAND_GOLD};margin:0 0 20px;border-radius:2px;"></div>"""


def _cta_button(text: str, url: str) -> str:
    return f"""
    <div style="text-align:center;margin:28px 0 0;">
      <a href="{url}" style="display:inline-block;background:{BRAND_GOLD};color:#ffffff;text-decoration:none;
         font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">{text}</a>
    </div>"""


def _message_box(text: str) -> str:
    return f"""
    <div style="background:#f8f8f8;border-left:4px solid {BRAND_GOLD};border-radius:0 8px 8px 0;
                padding:16px 20px;margin:20px 0;font-size:14px;line-height:1.7;color:#444444;white-space:pre-wrap;">{text}</div>"""


def _send(subject: str, plain: str, html: str, recipients: list[str]):
    msg = EmailMultiAlternatives(subject, plain, settings.DEFAULT_FROM_EMAIL, recipients)
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=False)


# ─── Tasks ────────────────────────────────────────────────────────────────────

@shared_task
def send_web_push(notification_id):
    from pywebpush import webpush, WebPushException
    from .models import Notification, PushSubscription

    try:
        notif = Notification.objects.get(id=notification_id)
    except Notification.DoesNotExist:
        return

    if not settings.VAPID_PRIVATE_KEY:
        return

    subs = PushSubscription.objects.filter(user=notif.recipient)
    if not subs.exists():
        return

    private_key_pem = base64.b64decode(settings.VAPID_PRIVATE_KEY).decode()
    payload = json.dumps({
        "title": notif.title,
        "body": notif.message,
        "url": notif.link or "/dashboard",
    })

    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=payload,
                vapid_private_key=private_key_pem,
                vapid_claims=settings.VAPID_CLAIMS,
            )
        except WebPushException as e:
            if e.response is not None and e.response.status_code in (404, 410):
                sub.delete()
        except Exception as exc:
            logger.error(f"Web push failed for sub {sub.id}: {exc}")


@shared_task(bind=True, max_retries=3)
def send_new_inquiry_notification(self, inquiry_id):
    try:
        from apps.properties.models import Inquiry
        from apps.tenants.models import TenantSettings

        inquiry = Inquiry.objects.select_related("property__tenant", "property__assigned_agent").get(pk=inquiry_id)
        prop = inquiry.property
        tenant = prop.tenant

        try:
            settings_obj = tenant.settings
            if not settings_obj.notify_new_inquiry_email:
                return
            admin_email = settings_obj.admin_notification_email or tenant.email
        except Exception:
            admin_email = tenant.email

        agent = prop.assigned_agent
        recipients = []
        if agent and agent.email:
            recipients.append(agent.email)
        if admin_email:
            recipients.append(admin_email)
        if not recipients:
            return

        subject = f"New Inquiry — {prop.title}"
        plain = (
            f"New property inquiry received.\n\n"
            f"Name: {inquiry.name}\nEmail: {inquiry.email}\nPhone: {inquiry.phone or 'N/A'}\n"
            f"Property: {prop.title}\n\nMessage:\n{inquiry.message}"
        )

        body_html = f"""
        {_heading("New Property Inquiry")}
        <p style="font-size:15px;color:#444444;margin:0 0 20px;">
          A potential buyer has submitted an inquiry on one of your listings. Details below.
        </p>
        {_info_table([
            ("Property", prop.title),
            ("Ref", prop.reference_id or "—"),
            ("Name", inquiry.name),
            ("Email", inquiry.email),
            ("Phone", inquiry.phone or "N/A"),
        ])}
        <p style="font-size:13px;font-weight:600;color:#555555;margin:24px 0 6px;">Message</p>
        {_message_box(inquiry.message)}
        {_cta_button("View Property", f"{BRAND_SITE}/listings/{prop.slug or prop.pk}")}
        """

        _send(subject, plain, _base_html(subject, body_html), recipients)

    except Exception as exc:
        logger.error(f"Failed to send inquiry notification: {exc}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_new_ticket_notification(self, ticket_id):
    try:
        from apps.helpdesk.models import Ticket

        ticket = Ticket.objects.select_related("tenant").get(pk=ticket_id)
        tenant = ticket.tenant
        admin_email = tenant.email
        if not admin_email:
            return

        subject = f"Support Ticket #{ticket.reference_number} — {ticket.subject}"
        plain = (
            f"New support ticket received.\n\n"
            f"Ticket: #{ticket.reference_number}\nSubject: {ticket.subject}\n"
            f"From: {ticket.client_name} ({ticket.client_email})\n"
            f"Priority: {ticket.get_priority_display()}\n\nDescription:\n{ticket.description}"
        )

        body_html = f"""
        {_heading(f"Support Ticket #{ticket.reference_number}")}
        <p style="font-size:15px;color:#444444;margin:0 0 20px;">
          A new support ticket has been submitted and requires your attention.
        </p>
        {_info_table([
            ("Ticket #", ticket.reference_number),
            ("Subject", ticket.subject),
            ("Client", ticket.client_name),
            ("Email", ticket.client_email),
            ("Priority", ticket.get_priority_display()),
        ])}
        <p style="font-size:13px;font-weight:600;color:#555555;margin:24px 0 6px;">Description</p>
        {_message_box(ticket.description)}
        {_cta_button("View Ticket", f"{BRAND_SITE}/dashboard/helpdesk")}
        """

        _send(subject, plain, _base_html(subject, body_html), [admin_email])

    except Exception as exc:
        logger.error(f"Failed to send ticket notification: {exc}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_id, token):
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(pk=user_id)

        reset_url = f"https://{settings.PLATFORM_DOMAIN}/auth/reset-password?token={token}"
        subject = "Reset Your Password — Umanie Homes Africa"
        plain = (
            f"Hi {user.get_full_name()},\n\n"
            f"Click the link below to reset your password:\n{reset_url}\n\n"
            f"This link expires in 2 hours. If you did not request this, ignore this email."
        )

        body_html = f"""
        {_heading("Password Reset Request")}
        <p style="font-size:15px;color:#444444;margin:0 0 8px;">Hi {user.get_full_name()},</p>
        <p style="font-size:15px;color:#444444;margin:0 0 24px;">
          We received a request to reset your password. Click the button below to set a new one.
          This link is valid for <strong>2 hours</strong>.
        </p>
        {_cta_button("Reset My Password", reset_url)}
        <p style="font-size:13px;color:#999999;margin:24px 0 0;text-align:center;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
        """

        _send(subject, plain, _base_html(subject, body_html), [user.email])

    except Exception as exc:
        logger.error(f"Failed to send password reset email: {exc}")
        raise self.retry(exc=exc, countdown=30)


@shared_task(bind=True, max_retries=3)
def send_new_lead_notification(self, lead_id):
    try:
        from apps.crm.models import Lead

        lead = Lead.objects.select_related("tenant", "assigned_agent", "property").get(pk=lead_id)
        tenant = lead.tenant
        agent = lead.assigned_agent

        recipients = []
        if agent and agent.email:
            recipients.append(agent.email)
        if tenant.email:
            recipients.append(tenant.email)
        if not recipients:
            return

        property_info = lead.property.title if lead.property else None
        subject = f"New Lead — {lead.name}"
        plain = (
            f"New lead captured.\n\n"
            f"Name: {lead.name}\nEmail: {lead.email}\nPhone: {lead.phone or 'N/A'}\n"
            f"Source: {lead.get_source_display()}\nPriority: {lead.get_priority_display()}\n"
            + (f"Property: {property_info}\n" if property_info else "")
            + f"\nMessage:\n{lead.message}"
        )

        rows = [
            ("Name", lead.name),
            ("Email", lead.email),
            ("Phone", lead.phone or "N/A"),
            ("Source", lead.get_source_display()),
            ("Priority", lead.get_priority_display()),
        ]
        if property_info:
            rows.append(("Property", property_info))

        body_html = f"""
        {_heading("New Lead Captured")}
        <p style="font-size:15px;color:#444444;margin:0 0 20px;">
          A new lead has entered the system. Follow up promptly to maximise conversion.
        </p>
        {_info_table(rows)}
        <p style="font-size:13px;font-weight:600;color:#555555;margin:24px 0 6px;">Message</p>
        {_message_box(lead.message or "No message provided.")}
        {_cta_button("View Lead in CRM", f"{BRAND_SITE}/dashboard/crm/leads")}
        """

        _send(subject, plain, _base_html(subject, body_html), recipients)

    except Exception as exc:
        logger.error(f"Failed to send lead notification: {exc}")
        raise self.retry(exc=exc, countdown=60)
