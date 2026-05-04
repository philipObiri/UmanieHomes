from django.core.management.base import BaseCommand
from django.core.mail import EmailMultiAlternatives
from django.conf import settings


BRAND_GOLD = "#C49E56"
BRAND_DARK = "#0a1f44"
BRAND_NAME = "Umanie Homes Africa"
BRAND_SITE = "https://umaniehomesafrica.com"

DEFAULT_RECIPIENT = "pobiriofficial@gmail.com"


def build_html(recipient_name: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Welcome to Umanie Homes Africa</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 0;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0"
      style="max-width:620px;width:100%;background:#ffffff;border-radius:14px;
             overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

      <!-- Header -->
      <tr>
        <td style="background:{BRAND_DARK};padding:36px 48px;text-align:center;">
          <img src="{BRAND_SITE}/main_logo.png" alt="{BRAND_NAME}"
               style="height:60px;width:auto;object-fit:contain;display:block;margin:0 auto 16px;" />
          <div style="width:48px;height:3px;background:{BRAND_GOLD};
                      margin:0 auto;border-radius:2px;"></div>
        </td>
      </tr>

      <!-- Gold accent bar -->
      <tr>
        <td style="background:{BRAND_GOLD};padding:0;height:4px;"></td>
      </tr>

      <!-- Hero message -->
      <tr>
        <td style="padding:48px 48px 32px;text-align:center;">
          <h1 style="margin:0 0 12px;font-size:28px;font-weight:800;
                     color:{BRAND_DARK};letter-spacing:-0.5px;line-height:1.2;">
            Welcome, {recipient_name}!
          </h1>
          <p style="margin:0;font-size:16px;color:#666666;line-height:1.7;">
            Thank you for connecting with <strong style="color:{BRAND_DARK};">{BRAND_NAME}</strong>.<br/>
            This is a test email confirming that our email delivery system is live and working perfectly.
          </p>
        </td>
      </tr>

      <!-- Divider -->
      <tr>
        <td style="padding:0 48px;">
          <div style="height:1px;background:#eeeeee;"></div>
        </td>
      </tr>

      <!-- Body content -->
      <tr>
        <td style="padding:32px 48px;">
          <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.8;">
            At <strong>{BRAND_NAME}</strong>, we believe a home is more than walls and a roof —
            it is <em>dignity, identity, and legacy</em>.
          </p>
          <p style="margin:0 0 28px;font-size:15px;color:#444444;line-height:1.8;">
            We are building premium real estate across Africa with one unwavering commitment:
            <strong style="color:{BRAND_DARK};">growth must never outpace integrity.</strong>
          </p>

          <!-- Feature cards -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              {"".join(f'''
              <td width="33%" style="padding:0 6px;vertical-align:top;">
                <div style="background:#f8f8f8;border-radius:10px;padding:20px 16px;text-align:center;">
                  <div style="font-size:28px;margin-bottom:10px;">{icon}</div>
                  <p style="margin:0;font-size:13px;font-weight:700;color:{BRAND_DARK};">{label}</p>
                </div>
              </td>''' for icon, label in [("🏡","Premium Listings"),("🤝","Trusted Agents"),("📈","Smart Investments")])}
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding:8px 48px 40px;text-align:center;">
          <a href="{BRAND_SITE}/listings"
             style="display:inline-block;background:{BRAND_GOLD};color:#ffffff;
                    text-decoration:none;font-weight:700;font-size:15px;
                    padding:16px 40px;border-radius:8px;letter-spacing:0.3px;">
            Explore Properties →
          </a>
        </td>
      </tr>

      <!-- Founder quote -->
      <tr>
        <td style="background:#f9f6f0;border-top:3px solid {BRAND_GOLD};
                   padding:28px 48px;text-align:center;">
          <p style="margin:0 0 10px;font-size:14px;color:#888888;font-style:italic;line-height:1.7;">
            "I commit to building spaces that outlive trends, outgrow limitations,<br/>
            and outlast my lifetime."
          </p>
          <p style="margin:0;font-size:13px;font-weight:700;color:{BRAND_DARK};">
            Emmanuel U. Solomon
          </p>
          <p style="margin:2px 0 0;font-size:12px;color:{BRAND_GOLD};font-weight:600;">
            Founder & CEO, {BRAND_NAME}
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#111111;padding:24px 48px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#999999;">
            {BRAND_NAME} &mdash; Premium Real Estate Across Africa
          </p>
          <p style="margin:0;font-size:12px;color:#555555;">
            This is an automated test email. &nbsp;|&nbsp;
            <a href="{BRAND_SITE}" style="color:{BRAND_GOLD};text-decoration:none;">{BRAND_SITE}</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""


class Command(BaseCommand):
    help = "Send a branded HTML test email to confirm email delivery is working."

    def add_arguments(self, parser):
        parser.add_argument(
            "--to",
            default=DEFAULT_RECIPIENT,
            help=f"Recipient email address (default: {DEFAULT_RECIPIENT})",
        )
        parser.add_argument(
            "--name",
            default="Philip",
            help="Recipient name used in the greeting (default: Philip)",
        )

    def handle(self, *args, **options):
        recipient = options["to"]
        name = options["name"]

        subject = f"Welcome to {BRAND_NAME} — Email System Test"

        plain = (
            f"Welcome, {name}!\n\n"
            f"This is a test email from {BRAND_NAME} confirming that email delivery is live.\n\n"
            f"At {BRAND_NAME}, we believe a home is more than walls and a roof — "
            f"it is dignity, identity, and legacy.\n\n"
            f"Growth must never outpace integrity.\n\n"
            f"— Emmanuel U. Solomon, Founder & CEO\n\n"
            f"Visit us: {BRAND_SITE}"
        )

        html = build_html(name)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )
        msg.attach_alternative(html, "text/html")

        self.stdout.write(f"Sending test email to {recipient} ...")
        try:
            msg.send(fail_silently=False)
            self.stdout.write(self.style.SUCCESS(f"  [OK] Email delivered to {recipient}"))
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f"  [FAIL] {exc}"))
