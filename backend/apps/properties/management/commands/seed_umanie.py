"""
Management command: python manage.py seed_umanie

Seeds Umanie Homes Africa as Tenant #1 with all real data from the live website.
Downloads and saves all property and gallery images locally.
"""
import os
import requests
import time
from pathlib import Path
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils import timezone
from django.conf import settings

# Gallery images shipped in frontend/public/gallery/ — loaded before falling back to URLs
GALLERY_LOCAL_DIR = "frontend/public/gallery"

# Local property images keyed by property label — filenames inside GALLERY_LOCAL_DIR
# The numbered images are duplex photos; the WA-prefixed ones are bungalow/site photos
PROPERTY_IMAGES_LOCAL = {
    "duplex": [
        "1-780x780.jpeg", "4-780x780.jpeg", "5-780x780.jpeg", "6-780x780.jpeg",
        "7-780x780.jpeg", "8--780x780.jpeg", "9-780x780.jpeg", "10-780x780.jpeg",
        "11-780x780.jpeg", "12-780x780.jpeg", "13-780x780.jpeg", "15-780x780.jpeg",
    ],
    "bungalow": [
        "IMG-20251217-WA0208-780x780.jpg", "IMG-20251217-WA0204-780x780.jpg",
        "IMG-20251217-WA0195-780x780.jpg", "IMG-20251217-WA0192-780x780.jpg",
        "IMG-20251217-WA0190-780x780.jpg", "IMG-20251217-WA0188-780x780.jpg",
        "IMG-20251217-WA0182-780x780.jpg", "IMG-20251217-WA0174-780x720.jpg",
        "IMG-20251217-WA0173-780x720.jpg", "IMG-20251217-WA0172-780x720.jpg",
    ],
}

# Team photos shipped in frontend/public/team/ — keyed by member name fragment
# Path is relative to BASE_DIR (project root, one level above backend/)
TEAM_PHOTOS = {
    "Emmanuel U. Solomon":  "frontend/public/team/Emmanual_Solomon.jpeg",
    "Sadongo":              "frontend/public/team/Sadongo_New_.jpg",
    "Jacob Plange-Rhule":  "frontend/public/team/Jacob_Plange_Rhule_.jpg",
    "Ronald Andrews Abbey": "frontend/public/team/Ronald Andrews Abbey.jpeg",
    "John Kwesi Quarm":    "frontend/public/team/John Kwesi Quarm Junior.jpeg",
}


PROPERTY_IMAGES_BUNGALOW = [
    f"https://www.umaniehomesafrica.com/wp-content/uploads/2026/02/100018403{i}.jpg"
    for i in range(9, 10)
] + [
    f"https://www.umaniehomesafrica.com/wp-content/uploads/2026/02/100018404{i}.jpg"
    for i in range(0, 9)
]  # 1000184039 through 1000184048

PROPERTY_IMAGES_DUPLEX = [
    f"https://www.umaniehomesafrica.com/wp-content/uploads/2026/02/{i}.jpeg"
    for i in range(1, 9)
] + [
    "https://www.umaniehomesafrica.com/wp-content/uploads/2026/02/8-.jpeg",
] + [
    f"https://www.umaniehomesafrica.com/wp-content/uploads/2026/02/{i}.jpeg"
    for i in range(9, 16)
]

GALLERY_IMAGES = [
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0208.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0204.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0195.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0192.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0190.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0188.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0182.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0174.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0173.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0172.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0165.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0167.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0168.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0169.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0161.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0159.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0157.jpg",
    "https://www.umaniehomesafrica.com/wp-content/uploads/2025/12/IMG-20251217-WA0156.jpg",
]


class Command(BaseCommand):
    help = "Seed Umanie Homes Africa as Tenant #1 with real data and download all images"

    def add_arguments(self, parser):
        parser.add_argument("--skip-images", action="store_true", help="Skip image downloads")
        parser.add_argument("--reset", action="store_true", help="Delete existing Umanie Homes data first")

    def handle(self, *args, **options):
        from apps.tenants.models import Tenant, TenantDomain, TenantSettings
        from apps.themes.models import ThemeConfig
        from apps.accounts.models import User, UserTenantRole
        from apps.cms.models import TeamMember, Testimonial, BlogPost, Category, FAQ, MediaFile
        from apps.properties.models import Property, PropertyImage

        skip_images = options["skip_images"]

        if options["reset"]:
            self.stdout.write("Deleting existing Umanie Homes data...")
            Tenant.objects.filter(slug="umanie-homes-africa").delete()

        # -- 1. Tenant ---------------------------------------------------------
        self.stdout.write(self.style.MIGRATE_HEADING("Creating Tenant: Umanie Homes Africa"))
        tenant, created = Tenant.objects.get_or_create(
            slug="umanie-homes-africa",
            defaults={
                "name": "Umanie Homes Africa",
                "plan": Tenant.PLAN_PROFESSIONAL,
                "is_active": True,
                "email": "info@umaniehomesafrica.com",
                "phone": "+233 54 969 5146",
                "address": "Main Street, Lashibi off Chicken Man Pizzaman",
                "city": "Tema",
                "country": "Ghana",
                "timezone": "Africa/Accra",
                "tagline": "Homes Inspired by African Dreams",
                "description": (
                    "Umanie Homes Africa is a premier real estate company dedicated to "
                    "developing quality, energy-efficient residential properties across Ghana. "
                    "We build homes that meet global standards while celebrating African heritage."
                ),
                "website": "https://www.umaniehomesafrica.com",
                "business_hours_start": "07:00",
                "business_hours_end": "19:00",
                "business_days": "Monday to Friday",
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"  [OK] Tenant created: {tenant.name}"))
        else:
            self.stdout.write(f"  -> Tenant already exists: {tenant.name}")

        TenantDomain.objects.get_or_create(
            tenant=tenant, domain="umaniehomesafrica.com", defaults={"is_primary": True}
        )
        TenantDomain.objects.get_or_create(
            tenant=tenant, domain="localhost", defaults={"is_primary": False}
        )

        # -- 2. Tenant Settings ------------------------------------------------
        settings_obj, _ = TenantSettings.objects.get_or_create(
            tenant=tenant,
            defaults={
                "enable_blog": True,
                "enable_gallery": True,
                "enable_helpdesk": True,
                "enable_chat_widget": True,
                "enable_newsletter": True,
                "enable_testimonials": True,
                "notify_new_lead_email": True,
                "notify_new_inquiry_email": True,
                "admin_notification_email": "info@umaniehomesafrica.com",
                "facebook_url": "https://www.facebook.com/umaniehomesafrica",
                "instagram_url": "https://www.instagram.com/umaniehomesafrica",
                "whatsapp_number": "+233549695146",
            },
        )

        # -- 3. Theme Config ---------------------------------------------------
        theme, _ = ThemeConfig.objects.get_or_create(
            tenant=tenant,
            defaults={
                "primary_color": "#004274",
                "secondary_color": "#0A1F44",
                "accent_color": "#C9A974",
                "background_color": "#FFFFFF",
                "surface_color": "#F9FAFB",
                "text_primary_color": "#111827",
                "text_secondary_color": "#4B5563",
                "nav_background": "#FFFFFF",
                "footer_background": "#0A1F44",
                "footer_text_color": "#FFFFFF",
                "font_family_heading": "Inter",
                "font_family_body": "Inter",
                "font_size_base": 16.0,
                "border_radius_base": 8.0,
                "dark_mode_enabled": True,
            },
        )
        self.stdout.write(self.style.SUCCESS("  [OK] Theme configured"))

        # -- 4. Admin User -----------------------------------------------------
        admin_user, created = User.objects.get_or_create(
            email="admin@umaniehomesafrica.com",
            defaults={
                "username": "umanie_admin",
                "first_name": "Emmanuel",
                "last_name": "Solomon",
                "phone": "+233 54 969 5146",
                "is_verified": True,
                "is_active": True,
            },
        )
        if created:
            from django.conf import settings as django_settings
            from decouple import config as decouple_config
            seed_password = decouple_config("SEED_ADMIN_PASSWORD", default="UmanieAdmin2025!")
            admin_user.set_password(seed_password)
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f"  [OK] Admin user created: admin@umaniehomesafrica.com / {seed_password}"))

        UserTenantRole.objects.get_or_create(
            user=admin_user, tenant=tenant, defaults={"role": "admin"}
        )

        # -- 5. Team Members ---------------------------------------------------
        self.stdout.write(self.style.MIGRATE_HEADING("Creating Team Members"))
        team_data = [
            {
                "name": "CSP Elvis Bawa Sadongo (Rtd.)",
                "title": "Advisory Board Member | CEO, Pempen Consult",
                "bio": (
                    "Chief Superintendent of Police (Rtd.) Elvis Bawa Sadongo is a distinguished security, "
                    "governance, and risk-management practitioner with over three decades of senior leadership "
                    "experience spanning public safety administration, internal security strategy, regulatory "
                    "engagement, and institutional oversight. During his distinguished service, he held senior "
                    "command and advisory positions within complex and high-risk operating environments, "
                    "including United Nations peacekeeping missions, where he worked alongside multinational "
                    "stakeholders to strengthen institutional stability, public safety, and rule-of-law "
                    "frameworks. He brings to the Board extensive expertise in enterprise risk management, "
                    "asset and site security, regulatory compliance, crisis and incident response, and "
                    "organizational resilience. Mr. Sadongo currently serves as CEO of Pempen Consult, "
                    "advising public and private sector institutions on security risk assessment, governance "
                    "frameworks, mediation, conflict resolution, and operational resilience."
                ),
                "location": "Accra, Ghana",
                "specialties": ["Security Risk Management", "Governance", "Crisis Response", "Mediation", "UN Peacekeeping"],
                "years_experience": 30,
                "order": 1,
            },
            {
                "name": "Dr. Jacob Plange-Rhule D.Statis, MBA, MSc, PhD",
                "title": "Advisory Board Member | Executive Director, Datbreau Research Ltd",
                "bio": (
                    "Dr. Jacob Plange-Rhule is an entrepreneur and transformational leader with over 20 years "
                    "of executive leadership experience spanning 11 industries including Business Consulting, "
                    "Telecommunications, Energy, Freight & Logistics, Hospitality, Transport, Agriculture, "
                    "Real Estate, Construction, and Mass Communication. He holds an MSc in International "
                    "Business from the University of Ghana Business School, an MA in E-Business & Marketing "
                    "Strategy from GCTU, an MBA from the Australian Institute of Business, and is a PhD "
                    "scholar in Business Administration. He has served in senior roles across organizations "
                    "including Surfline Communications, Expresso Telecom, Kasapa Telecom, Adom Group (as "
                    "Group General Manager and Deputy Managing Director of Adom City Estate), and is "
                    "currently Executive Director of Datbreau Research Limited. A Board Member of Surfline "
                    "Communications Limited and Advisory Board Chairman of Capacity and Recruitment Towers "
                    "Limited, Dr. Plange-Rhule is a Professional Member of CIHRMP, Fellow of the Chartered "
                    "Institute of Leadership & Governance (USA-Ghana chapter), and an adjunct lecturer at "
                    "the University of Gold Coast. He is an expert in Leadership Re-engineering, "
                    "Organizational Turnaround, and Value Chain Modelling."
                ),
                "location": "Accra, Ghana",
                "specialties": ["Executive Leadership", "HR Management", "Business Strategy", "Organizational Turnaround", "Research"],
                "years_experience": 20,
                "order": 2,
            },
            {
                "name": "Ronald Andrews Abbey MSc, AFA, MIPA",
                "title": "Advisory Board Member | Director of Finance, University of Gold Coast",
                "bio": (
                    "Ronald Andrews Abbey is a distinguished finance executive and the Director of Finance "
                    "at the University of Gold Coast (formerly Accra Business School), where he provides "
                    "strategic leadership over the institution's financial governance, sustainability, and "
                    "long-term growth agenda. He holds an MSc in Accounting and Finance and is an Associate "
                    "Member of the Institute of Financial Accountants (UK) and the Institute of Public "
                    "Accountants (Australia). With a proven track record in debt financing, financial policy "
                    "formulation, and system optimization, Ronald has been instrumental in supporting "
                    "institutional expansion, capital projects, and infrastructure development. His leadership "
                    "has strengthened financial resilience through robust budgeting frameworks, tax planning "
                    "strategies, enterprise risk management, and disciplined cost control mechanisms. "
                    "Renowned for his analytical rigor and strategic foresight, he consistently enhances "
                    "financial controls, compliance standards, and operational efficiency."
                ),
                "location": "Accra, Ghana",
                "specialties": ["Debt Financing", "Financial Governance", "Risk Management", "Tax Planning", "Capital Projects"],
                "years_experience": 15,
                "order": 3,
            },
            {
                "name": "Dr. John Kwesi Quarm Junior PhD, P.E-GhIE",
                "title": "Advisory Board Member | Managing Director, Quarm Associates Ltd",
                "bio": (
                    "John Kwesi Quarm Junior is a highly accomplished Civil and Structural Engineer, "
                    "academic scholar, and real estate development leader with nearly two decades of "
                    "professional experience delivering complex infrastructure and building projects across "
                    "Ghana. As a PhD holder in Structural Engineering and a Professional Engineer (GhIE), "
                    "he brings exceptional technical depth, strategic foresight, and executional excellence "
                    "to UMANIE Homes Africa. Throughout his career, Dr. Quarm has led the design, "
                    "supervision, and delivery of high-value residential, institutional, commercial, and "
                    "faith-based developments, including multi-storey apartments, shopping malls, "
                    "auditoriums, road infrastructure, and critical public facilities. He served for over "
                    "a decade at the University of Cape Coast, overseeing landmark projects funded by "
                    "national and international bodies. As Managing Director of Quarm Associates Ltd, he "
                    "has executed large-scale developments across Greater Accra, Central, Western, and "
                    "Eastern Regions of Ghana. Dr. Quarm is also a published researcher with peer-reviewed "
                    "articles on sustainable construction materials, concrete performance optimization, and "
                    "structural integrity of locally manufactured reinforcement systems."
                ),
                "location": "Accra, Ghana",
                "specialties": ["Structural Engineering", "Civil Engineering", "Project Management", "Sustainable Construction", "Research"],
                "years_experience": 18,
                "order": 4,
            },
            {
                "name": "Emmanuel U. Solomon",
                "title": "Chief Executive Officer & Founder",
                "bio": (
                    "Emmanuel U. Solomon is the founder and CEO of Umanie Homes Africa. He leads with "
                    "the conviction that growth must never outpace integrity — building premium real "
                    "estate across Africa that creates generational wealth for families and investors. "
                    "Entrusted with life savings and dreams that span generations, Emmanuel commits to "
                    "building spaces that outlive trends, outgrow limitations, and outlast a lifetime."
                ),
                "location": "Tema, Ghana",
                "email": "info@umaniehomesafrica.com",
                "phone": "+233 54 969 5146",
                "specialties": ["Real Estate Development", "Business Strategy", "Leadership", "African Markets"],
                "years_experience": 10,
                "order": 0,
                "is_featured": True,
            },
        ]

        for member_data in team_data:
            is_featured = member_data.pop("is_featured", True)
            member, _ = TeamMember.objects.get_or_create(
                tenant=tenant,
                name=member_data["name"],
                defaults={**member_data, "is_featured": is_featured},
            )

            # Attach local photo if not already set and file exists
            if not skip_images and not member.photo_id:
                self._attach_team_photo(member, tenant, admin_user)

            self.stdout.write(f"  [OK] {member_data['name']}")

        # -- 6. Testimonials ---------------------------------------------------
        self.stdout.write(self.style.MIGRATE_HEADING("Creating Testimonials"))
        testimonials_data = [
            {
                "name": "Sarah Collins",
                "title": "First-Time Homebuyer",
                "quote": "Working for the first time with this team was effortless from day one. They understood exactly what I needed and guided me through every step. I couldn't be happier with my new home in Lashibi.",
                "rating": 5,
                "location": "Accra, Ghana",
                "order": 1,
            },
            {
                "name": "Michael Ejzur",
                "title": "Home Seller",
                "quote": "When it was time to sell, they delivered everything beyond expectations. Their market knowledge and professional representation got me the best price. Highly recommended for anyone serious about real estate.",
                "rating": 5,
                "location": "Tema, Ghana",
                "order": 2,
            },
            {
                "name": "Peter Asare",
                "title": "Real Estate Investor",
                "quote": "I've invested in several properties, but this agency made the process smooth and transparent. Their financial advisory and property selection expertise is unmatched in Ghana.",
                "rating": 5,
                "location": "Accra, Ghana",
                "order": 3,
            },
            {
                "name": "Mavis Parker",
                "title": "Client",
                "quote": "They didn't just help me find a house -- they helped me find my relocation place. The team understood my lifestyle, my budget, and found me the perfect home. I am genuinely grateful.",
                "rating": 5,
                "location": "Tema, Ghana",
                "order": 4,
            },
        ]

        for t_data in testimonials_data:
            Testimonial.objects.get_or_create(tenant=tenant, name=t_data["name"], defaults=t_data)
            self.stdout.write(f"  [OK] {t_data['name']}")

        # -- 7. FAQs -----------------------------------------------------------
        self.stdout.write(self.style.MIGRATE_HEADING("Creating FAQs"))
        faqs = [
            {"category": "buying", "question": "What is the typical process for buying a property with Umanie Homes?", "answer": "Our buying process begins with a free consultation to understand your needs and budget. We then match you with suitable properties, arrange private viewings, guide you through offer negotiations, assist with documentation and legal due diligence, and provide mortgage financing referrals if needed. We stay with you from first inquiry to key handover.", "order": 1},
            {"category": "buying", "question": "Do you offer mortgage financing assistance?", "answer": "Yes. While we don't directly provide mortgages, we have strong relationships with trusted banks and mortgage advisors across Ghana. We can connect you with the right financial partners and help you understand your financing options to make your purchase more affordable.", "order": 2},
            {"category": "buying", "question": "How do I schedule a property viewing?", "answer": "You can schedule a private tour by clicking 'Book a Tour' on any property listing, calling us at +233 54 969 5146, emailing sales@umaniehomesafrica.com, or using our live chat. We offer flexible viewing times Monday through Friday, 7AM to 7PM.", "order": 3},
            {"category": "selling", "question": "How do you determine the value of my property?", "answer": "Our team conducts a comprehensive property valuation considering location, size, condition, comparable recent sales in the area, current market conditions, and potential rental yield. We provide a detailed valuation report at no cost to serious sellers.", "order": 1},
            {"category": "selling", "question": "What marketing do you provide for listings?", "answer": "We offer premium marketing including professional photography, virtual tours, featured placement on our website, social media campaigns, targeted email marketing to our buyer database, and direct outreach to qualified investors.", "order": 2},
            {"category": "renting", "question": "Do you manage rental properties on behalf of landlords?", "answer": "Yes. We offer comprehensive property management services including tenant screening, rent collection, maintenance coordination, and monthly financial reporting -- allowing you to earn passive income without the hassle.", "order": 1},
            {"category": "financing", "question": "What documents do I need to buy a property in Ghana?", "answer": "Typically you'll need a valid national ID or passport, proof of income (payslips or bank statements for 6 months), proof of address, tax identification number (TIN), and any business registration documents if buying through a company.", "order": 1},
            {"category": "general", "question": "Are your properties energy-efficient?", "answer": "Absolutely. All our residential properties are built with energy efficiency in mind. Our current developments in Lashibi have an Energy Performance Index of 92.9 KWH and are rated Energy Class A, meaning lower utility bills and a smaller carbon footprint.", "order": 1},
            {"category": "general", "question": "What makes Umanie Homes different from other developers?", "answer": "We combine global building standards with African architectural sensibilities. Our advisory board includes experts in security, finance, civil engineering, and business management. We don't just sell properties -- we build communities where African families can thrive.", "order": 2},
        ]

        for faq_data in faqs:
            FAQ.objects.get_or_create(
                tenant=tenant,
                question=faq_data["question"],
                defaults=faq_data,
            )
        self.stdout.write(f"  [OK] {len(faqs)} FAQs created")

        # -- 8. Blog Categories + Posts ----------------------------------------
        self.stdout.write(self.style.MIGRATE_HEADING("Creating Blog Content"))

        cat_market, _ = Category.objects.get_or_create(
            tenant=tenant, slug="market-insights",
            defaults={"name": "Market Insights", "color": "#004274"},
        )
        cat_buying, _ = Category.objects.get_or_create(
            tenant=tenant, slug="buying-guide",
            defaults={"name": "Buying Guide", "color": "#C9A974"},
        )
        cat_sustainable, _ = Category.objects.get_or_create(
            tenant=tenant, slug="sustainable-living",
            defaults={"name": "Sustainable Living", "color": "#2E7D32"},
        )

        # Post 0 — original brand post
        BlogPost.objects.get_or_create(
            tenant=tenant,
            slug="why-we-love-real-estate",
            defaults={
                "title": "Why We Love Real Estate",
                "excerpt": "Real estate remains one of Africa's most dynamic and rewarding industries. Understanding the market, the competition, and client needs is what separates great agencies from the rest.",
                "content": {
                    "type": "doc",
                    "content": [
                        {"type": "paragraph", "content": [{"type": "text", "text": "Real estate is more than just buying and selling properties -- it is about building communities, creating wealth, and fulfilling the African dream of homeownership. At Umanie Homes Africa, we believe that every family deserves a quality home, and every investor deserves a reliable partner."}]},
                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Understanding the Market"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "The African real estate market is competitive and rapidly evolving. From residential properties in Accra to commercial developments across the continent, understanding local dynamics is critical. Buyers, sellers, and investors all have distinct needs that must be met with precision and professionalism."}]},
                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Our Commitment"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "We are committed to the 5 Es: Excellence in our builds, Ethics in every transaction, Execution of every promise, Enterprise in our thinking, and Evolution in our methods. These principles guide everything we do at Umanie Homes Africa."}]},
                    ]
                },
                "is_published": True,
                "is_featured": True,
                "published_at": timezone.now(),
                "read_time_minutes": 5,
                "author": admin_user,
                "category": cat_market,
                "meta_title": "Why We Love Real Estate | Umanie Homes Africa",
                "meta_description": "Discover why Umanie Homes Africa is passionate about real estate and how we're transforming the African property market.",
            },
        )
        self.stdout.write("  [OK] Blog post: Why We Love Real Estate")

        # Post 1 — Ghana real estate market outlook
        BlogPost.objects.get_or_create(
            tenant=tenant,
            slug="ghana-real-estate-market-outlook-2026",
            defaults={
                "title": "Ghana Real Estate Market Outlook 2026: Where Smart Money Is Moving",
                "excerpt": "Ghana's residential property market is defying global headwinds. Demand for quality housing in Greater Accra and Tema continues to outpace supply, driving steady appreciation in key corridors like Lashibi, East Legon, and Airport Hills.",
                "read_time_minutes": 7,
                "is_published": True,
                "is_featured": True,
                "published_at": timezone.now() - timezone.timedelta(days=14),
                "author": admin_user,
                "category": cat_market,
                "meta_title": "Ghana Real Estate Market Outlook 2026 | Umanie Homes Africa",
                "meta_description": "An in-depth look at Ghana's 2026 property market trends, the top residential corridors, pricing benchmarks, and where investors are finding the best returns.",
                "content": {
                    "type": "doc",
                    "content": [
                        {"type": "paragraph", "content": [{"type": "text", "text": "Ghana's property market has demonstrated remarkable resilience over the past two years. Despite currency pressures from a depreciating cedi and global interest rate headwinds, demand for quality residential housing in Greater Accra and the Tema Metropolitan Area continues to significantly outpace supply. For informed buyers and investors, this imbalance represents a generational opportunity."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "The Supply Gap Driving Demand"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Ghana faces a housing deficit estimated at 1.8 million units, according to the Ghana Real Estate Developers Association (GREDA). The bulk of this deficit is concentrated in the lower-to-middle income bracket, but even the mid-market segment -- homes priced between $80,000 and $300,000 USD -- is severely undersupplied. Population growth in Greater Accra of approximately 3.5% annually continues to compress vacancy rates in established residential zones."}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "In Tema specifically, the industrial expansion of the Tema Port and the Free Zones enclave has brought thousands of expatriate workers, government contractors, and returning diaspora buyers into the market. This demographic consistently demands quality-finished, security-conscious residential properties -- exactly the segment where Tema Community 14 (Lashibi) has emerged as a flagship address."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Key Residential Corridors in 2026"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "East Legon and its extensions (Adjiringanor, American House) remain the premium residential benchmark, with 4-bedroom houses commanding GHS 7,000–14,000 per month in rent and sale prices for comparable properties regularly exceeding $450,000 USD. Supply here is constrained by land availability and high construction costs."}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Lashibi and Community 14, Tema, have emerged as the value proposition of the decade. Positioned along the Spintex Road corridor with direct access to the Accra-Tema Motorway, Lashibi offers a compelling combination of proximity to Accra's commercial district (20–25 minutes off-peak), established infrastructure, and security. Average land prices in the area have appreciated approximately 18–22% year-on-year since 2023, according to real estate valuation reports from Broll Ghana and Knight Frank Africa."}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Airport Hills and Dzorwulu continue to attract embassy-affiliated tenants and multinational executives, sustaining dollar-denominated rental yields of 6–8% annually -- among the highest in sub-Saharan Africa for the residential segment."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Pricing Benchmarks: What Buyers Are Actually Paying"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Based on transactions observed across the Greater Accra market in 2025–2026, typical price ranges are: 3-bedroom detached houses in Lashibi/Community 14: $130,000–$200,000 USD. 4-bedroom duplexes in the same corridor: $220,000–$320,000 USD. Comparable properties in East Legon: $350,000–$600,000 USD. The Lashibi corridor therefore represents a 40–50% discount to East Legon with broadly comparable build quality for newly developed properties, making it the most compelling value market in Greater Accra today."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "The Diaspora Effect"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "The Ghanaian diaspora -- estimated at 3 million people globally, with large concentrations in the United Kingdom, United States, and Canada -- has become the single most important demand driver in the mid-to-upper residential segment. Diaspora buyers typically transact in foreign currency, are less sensitive to cedi depreciation, and prioritize quality finishes, reliable water and power supply, and secure communities. Developers who meet these standards -- including energy-independent designs and quality certifications -- command a significant premium and consistently achieve faster sales cycles."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Our Outlook"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "We expect residential property values in the Lashibi–Spintex corridor to continue appreciating at 15–20% annually in USD terms through 2027, driven by sustained diaspora demand, infrastructure investments along the Accra-Tema motorway extension, and the chronic undersupply of quality stock. For buyers considering entry, 2026 represents the last window before new supply constraints push prices firmly past the $200,000 median for 3-bedroom finished homes in this corridor."}]},
                    ]
                },
            },
        )
        self.stdout.write("  [OK] Blog post: Ghana Real Estate Market Outlook 2026")

        # Post 2 — Complete guide to buying property in Ghana
        BlogPost.objects.get_or_create(
            tenant=tenant,
            slug="complete-guide-buying-property-ghana",
            defaults={
                "title": "The Complete Guide to Buying Property in Ghana: Legal Process, Costs & Due Diligence",
                "excerpt": "Buying property in Ghana as a first-time buyer or returning diaspora can feel overwhelming. This step-by-step guide covers everything from land title verification and stamp duty to the final registration at the Lands Commission.",
                "read_time_minutes": 10,
                "is_published": True,
                "is_featured": False,
                "published_at": timezone.now() - timezone.timedelta(days=30),
                "author": admin_user,
                "category": cat_buying,
                "meta_title": "Complete Guide to Buying Property in Ghana | Umanie Homes Africa",
                "meta_description": "Step-by-step guide to buying property in Ghana covering land title types, stamp duty, Lands Commission registration, due diligence, and protecting your investment.",
                "content": {
                    "type": "doc",
                    "content": [
                        {"type": "paragraph", "content": [{"type": "text", "text": "Purchasing property in Ghana is one of the most significant financial decisions you will make. Whether you are a first-time buyer, a returning member of the diaspora, or a seasoned investor, navigating Ghana's land tenure system and legal processes requires careful preparation. This guide walks you through every stage of the process, from initial search to the moment you receive your registered title document."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Understanding Ghana's Land Tenure System"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Ghana's land tenure system is one of the more complex in West Africa, governed by a mix of customary law, statutory law, and colonial-era frameworks. There are broadly four types of land ownership: State Land (acquired by the government under various ordinances), Vested Land (managed by the government on behalf of stools or families), Stool/Skin Land (owned by traditional authorities), and Family/Individual Land (privately held). Most residential transactions in Greater Accra and Tema involve either Stool Land or Family Land."}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "When purchasing from a developer like Umanie Homes Africa, the developer will typically have already converted the underlying customary or stool title into a registered Leasehold or Freehold interest. This simplifies the buyer's due diligence considerably -- you are dealing with a registered instrument rather than an unregistered customary allocation."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Step 1: Title Search at the Lands Commission"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Before paying any deposit, instruct a licensed surveyor or solicitor to conduct a title search at the Lands Commission's offices in Accra. The Lands Commission of Ghana (established under the Lands Commission Act 2008, Act 767) maintains the Land Administration Project database. A title search will reveal: who is registered as the owner, whether there are any encumbrances (mortgages, caveats, adverse claims), the extent and boundaries of the parcel, and any government acquisition affecting the land. Budget GHS 500–1,500 for a formal title search, which typically takes 5–10 working days."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Step 2: Site Inspection and Survey"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "A physical inspection by a licensed land surveyor is non-negotiable. The surveyor will verify that the site plan matches what is on the ground, that boundaries are correctly pegged, and that there are no encroachments from neighbours. The survey plan (also called an indenture plan or site plan) must be signed and stamped by a registered surveyor and will form part of your conveyancing documents. Expect to pay GHS 800–2,500 depending on the size of the parcel and the surveying firm."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Step 3: Sale and Purchase Agreement"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Once due diligence is satisfactory, your solicitor will draft a Sale and Purchase Agreement (SPA). The SPA should clearly state the agreed purchase price and currency, payment schedule and milestones, the nature of the title being transferred (leasehold or freehold, and the lease term if applicable), completion date, and remedies for default by either party. Do not sign any SPA without having it reviewed by an independent solicitor. Legal fees for residential conveyancing in Ghana typically run 1–2% of the purchase price."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Step 4: Stamp Duty and Transfer Fees"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Ghana's Stamp Duty Act requires that the conveyancing instrument (the indenture or deed of assignment) be stamped before it can be registered. The rate applicable to residential property transfers is 0.5% of the higher of the purchase price or the assessed market value. In addition, expect to budget for: Lands Commission registration fees (approximately 0.25% of property value), Capital Gains Tax if the seller is an individual (15% of the chargeable gain -- typically a seller-side cost), and VAT on developer sales where applicable (currently 15% standard VAT applies to developer-sold properties under GRA guidelines). In practice, for a property sold at $150,000 USD equivalent, total buyer-side transaction costs typically amount to 2.5–4% of the purchase price."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Step 5: Registration at the Lands Commission"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "After stamping, the conveyancing instrument must be registered at the Lands Commission to perfect your title. Registered title is the only form of ownership recognised by the courts in a priority dispute. Registration typically takes 30–90 days under normal processing, though an express registration service is available for an additional fee. Once registered, you will receive a registered indenture bearing the Lands Commission seal and registration number -- this is your proof of ownership."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Documents You Will Need"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "As a buyer, prepare the following: valid national identification (Ghana Card, passport or voter's ID), Tax Identification Number (TIN) -- mandatory for all property transactions above a de minimis threshold, proof of funds or mortgage pre-approval letter, and for diaspora buyers, notarised copies of foreign identification documents. Foreign nationals (non-Ghanaians) can legally own property in Ghana but may only hold Leasehold titles for a maximum of 50 years, renewable. They may not hold Freehold or allodial title."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Working With a Reputable Developer"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "The single most effective way to reduce transaction risk is to purchase from a GREDA-registered developer with a proven track record of title delivery. Reputable developers complete the land registration process before selling units, provide clean indentures, and assist buyers through the stamping and registration process. At Umanie Homes Africa, we guide every buyer from contract signing to receipt of their registered title document -- with full transparency at every stage. Contact us at info@umaniehomesafrica.com or call +233 54 969 5146 to speak with a member of our sales team."}]},
                    ]
                },
            },
        )
        self.stdout.write("  [OK] Blog post: Complete Guide to Buying Property in Ghana")

        # Post 3 — Energy-efficient homes in Ghana
        BlogPost.objects.get_or_create(
            tenant=tenant,
            slug="energy-efficient-homes-ghana-why-it-matters",
            defaults={
                "title": "Why Energy-Efficient Homes Are the Smartest Investment in Ghana Right Now",
                "excerpt": "With ECG tariffs rising and load-shedding unpredictable, energy-efficient homes are no longer a luxury feature -- they are a financial necessity. Here is what Energy Class A certification means for Ghanaian homeowners and how it translates directly to lower monthly costs.",
                "read_time_minutes": 8,
                "is_published": True,
                "is_featured": False,
                "published_at": timezone.now() - timezone.timedelta(days=7),
                "author": admin_user,
                "category": cat_sustainable,
                "meta_title": "Energy-Efficient Homes in Ghana: Why It Matters | Umanie Homes Africa",
                "meta_description": "Ghana's rising ECG tariffs make energy-efficient homes a financial priority. Learn what Energy Class A means, the EPI rating system, and how it reduces your monthly utility bills.",
                "content": {
                    "type": "doc",
                    "content": [
                        {"type": "paragraph", "content": [{"type": "text", "text": "Ghana's electricity sector has undergone significant disruption over the past decade. ECG (Electricity Company of Ghana) tariff reviews have increased residential electricity costs by more than 60% in real terms since 2020, and load-shedding -- locally known as 'dumsor' -- remains an ever-present risk for households without backup power. In this environment, the energy performance of a home has moved from being a marketing bullet point to a primary financial consideration for any serious buyer."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "What Is an Energy Performance Index (EPI)?"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "The Energy Performance Index (EPI) measures the amount of energy a building consumes per square metre of floor area per year, expressed in kilowatt-hours per square metre (kWh/m²/year). In Ghana, the Ghana Standards Authority (GSA) and the Energy Commission have adopted an energy classification framework aligned with international standards used in Europe and increasingly across West Africa. Under this framework, buildings are rated from Class A (most efficient, EPI below 100 kWh/m²/year) to Class G (least efficient, above 450 kWh/m²/year)."}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "All residential properties developed by Umanie Homes Africa achieve an EPI of 92.9 kWh/m²/year and are independently certified as Energy Class A. This places our properties among the most energy-efficient residential buildings in the Greater Accra region."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "How Is This Achieved? The Technical Approach"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Energy Class A performance does not happen by accident -- it requires deliberate design choices throughout the construction process. Our properties incorporate: high-performance wall insulation that reduces heat transfer from Ghana's tropical climate into the living space, reducing air conditioning loads; thermally broken window frames and double-glazed louvre and casement windows that limit solar heat gain; roof insulation with a minimum R-value of R-20, drastically reducing ceiling temperatures during peak afternoon heat; LED lighting throughout (consuming 60–80% less electricity than incandescent equivalents); energy-efficient water heating systems designed for solar collector integration; and building orientation optimised to maximise cross-ventilation and reduce dependence on mechanical cooling."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "The Real Numbers: What This Saves You Every Month"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "A conventional 3-bedroom home in Ghana built to average standards typically consumes 650–900 kWh per month in electricity, translating to monthly ECG bills of GHS 900–1,400 at current residential tariffs (Lifeline Band and Non-Lifeline combined, as of Q1 2026). An Energy Class A home of equivalent size, by design, will consume 35–50% less energy under equivalent occupancy -- reducing monthly electricity expenditure to approximately GHS 500–750. Over a 10-year period, the cumulative saving is GHS 48,000–78,000 at current tariff levels -- not accounting for the near-certain further tariff increases that the PURC (Public Utilities Regulatory Commission) has signalled for 2026 and 2027."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Solar Readiness and Backup Power Integration"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "All Umanie Homes Africa properties are constructed as solar-ready, meaning the roof structure, electrical panel configuration, and conduit routing are designed from the foundation to support a future grid-tied or off-grid photovoltaic (PV) system without costly retrofitting. A typical 5 kWp solar PV system installed on our 3-bedroom bungalow would -- based on Accra's average solar irradiance of 5.2 peak sun hours per day -- generate approximately 650–700 kWh per month, effectively offsetting the entire grid electricity consumption of an energy-efficient home. At current panel prices in Ghana (approximately GHS 12,000–18,000 for a 5 kWp system with battery backup), payback periods are typically 5–7 years, after which the system generates effectively free electricity for its remaining 15–20 year operational life."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Energy Efficiency and Property Value"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "Beyond the direct utility savings, energy performance certification is beginning to influence property valuations in Ghana's upper-residential segment. Diaspora buyers and multinational tenants -- increasingly the key demand drivers in the $130,000+ price bracket -- consistently rate reliable power and low running costs as top-three decision factors in their property search. Certified energy-efficient homes in this segment are achieving rental premiums of 8–15% over comparable uncertified properties, according to valuations conducted by licensed RICS-affiliated surveyors operating in the Accra market."}]},

                        {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "The Bottom Line"}]},
                        {"type": "paragraph", "content": [{"type": "text", "text": "In a market where electricity costs are rising, grid reliability is uncertain, and discerning buyers are increasingly well-informed, energy performance is no longer a secondary consideration -- it is a primary driver of both liveability and long-term asset value. If you are evaluating residential properties in Ghana, we strongly recommend making Energy Class A certification a non-negotiable requirement in your search criteria. Our team is happy to walk you through our energy performance documentation and connect you with independent engineers who can verify our EPI rating. Reach us at info@umaniehomesafrica.com or +233 54 969 5146."}]},
                    ]
                },
            },
        )
        self.stdout.write("  [OK] Blog post: Energy-Efficient Homes in Ghana")

        # -- 9. Properties -----------------------------------------------------
        self.stdout.write(self.style.MIGRATE_HEADING("Creating Properties"))

        bungalow, b_created = Property.objects.get_or_create(
            tenant=tenant,
            slug="3-bedroom-bungalow-lashibi",
            defaults={
                "reference_id": "UMH-2026-001",
                "title": "3 Bedrooms Bungalow with Boys Quarters",
                "description": (
                    "A stunning 3-bedroom bungalow with self-contained boys quarters, located in the "
                    "prestigious Community 14 Lashibi area, directly opposite the Lashibi ECG District Office "
                    "off the Spintex Road. This property combines modern architectural design with energy-efficient "
                    "construction to deliver a world-class living experience.\n\n"
                    "The property features spacious bedrooms with built-in wardrobes, a modern kitchen with "
                    "premium finishes, 4 bathrooms, a landscaped compound, and a self-contained boys quarters. "
                    "Built to Energy Class A standards with an EPI of 92.9 KWH, ensuring minimal utility costs."
                ),
                "property_type": "bungalow",
                "listing_type": "sale",
                "status": "available",
                "price": 150000,
                "currency": "USD",
                "bedrooms": 3,
                "bathrooms": 4,
                "toilets": 4,
                "area_sqm": 0.08,
                "parking_spaces": 1,
                "energy_class": "A",
                "energy_performance_index": 92.9,
                "boys_quarters": True,
                "address": "Community 14 Lashibi, opposite Lashibi ECG District Office, off the Spintex Road",
                "city": "Tema",
                "area": "Lashibi",
                "region": "Greater Accra",
                "country": "Ghana",
                "latitude": 5.5913,
                "longitude": -0.0981,
                "features": [
                    "Boys Quarters (Self-contained)", "Energy Class A", "Modern Kitchen",
                    "Built-in Wardrobes", "Landscaped Compound", "Security", "Tiled Floors",
                    "PVC Ceiling", "Solar Ready", "Borehole"
                ],
                "is_featured": True,
                "is_published": True,
                "assigned_agent": admin_user,
                "created_by": admin_user,
            },
        )
        if b_created:
            self.stdout.write("  [OK] 3 Bedroom Bungalow created")

        duplex, d_created = Property.objects.get_or_create(
            tenant=tenant,
            slug="4-bedroom-duplex-lashibi",
            defaults={
                "reference_id": "UMH-2026-002",
                "title": "4 Bedrooms Duplex with Boys Quarters",
                "description": (
                    "An exceptional 4-bedroom duplex with self-contained boys quarters, located in "
                    "Community 14 Lashibi, one of Tema's most sought-after residential communities. "
                    "This architecturally impressive duplex offers two floors of premium living space.\n\n"
                    "Features include 4 spacious bedrooms across two floors, 5 modern bathrooms, "
                    "an open-plan living and dining area, a chef's kitchen with premium appliances, "
                    "a self-contained boys quarters, landscaped front and back garden, and covered "
                    "parking. Built to energy-efficient standards with Energy Class A certification."
                ),
                "property_type": "duplex",
                "listing_type": "sale",
                "status": "available",
                "price": 270000,
                "currency": "USD",
                "bedrooms": 4,
                "bathrooms": 5,
                "toilets": 5,
                "area_sqm": 0.08,
                "floors": 2,
                "parking_spaces": 1,
                "energy_class": "A",
                "energy_performance_index": 92.9,
                "boys_quarters": True,
                "address": "Community 14 Lashibi, opposite Lashibi ECG District Office, off the Spintex Road",
                "city": "Tema",
                "area": "Lashibi",
                "region": "Greater Accra",
                "country": "Ghana",
                "latitude": 5.5915,
                "longitude": -0.0983,
                "features": [
                    "Boys Quarters (Self-contained)", "Energy Class A", "Open-Plan Living",
                    "Chef's Kitchen", "Premium Appliances", "Covered Parking", "Two Floors",
                    "Built-in Wardrobes", "Security", "Landscaped Garden", "Borehole"
                ],
                "is_featured": True,
                "is_published": True,
                "assigned_agent": admin_user,
                "created_by": admin_user,
            },
        )
        if d_created:
            self.stdout.write("  [OK] 4 Bedroom Duplex created")

        # -- 10. Download & Attach Images --------------------------------------
        if not skip_images:
            self.stdout.write(self.style.MIGRATE_HEADING("Loading Property Images"))
            self._load_property_images(bungalow, "bungalow", PROPERTY_IMAGES_BUNGALOW)
            self._load_property_images(duplex, "duplex", PROPERTY_IMAGES_DUPLEX)

            self.stdout.write(self.style.MIGRATE_HEADING("Downloading Gallery Images"))
            self._download_gallery_images(tenant, admin_user)
        else:
            self.stdout.write("  -> Skipping image downloads (--skip-images flag)")

        self.stdout.write(self.style.SUCCESS("\n[DONE] Umanie Homes Africa seeded successfully!"))
        self.stdout.write(f"   Tenant: {tenant.name}")
        self.stdout.write(f"   Admin: admin@umaniehomesafrica.com / UmanieAdmin2025!")
        self.stdout.write(f"   Properties: 2")
        self.stdout.write(f"   Team members: {len(team_data)}")
        self.stdout.write(f"   Testimonials: {len(testimonials_data)}")
        self.stdout.write(f"   FAQs: {len(faqs)}")

    def _attach_team_photo(self, member, tenant, uploaded_by):
        from apps.cms.models import MediaFile

        # Find the matching photo path by checking each key against the member name
        photo_rel = None
        for name_fragment, rel_path in TEAM_PHOTOS.items():
            if name_fragment in member.name:
                photo_rel = rel_path
                break

        if not photo_rel:
            return  # No photo mapped for this member

        # Resolve path relative to BASE_DIR (project root, parent of backend/)
        photo_path = settings.BASE_DIR.parent / photo_rel
        if not photo_path.exists():
            self.stdout.write(self.style.WARNING(f"    [SKIP] Photo not found: {photo_path}"))
            return

        try:
            filename = photo_path.name
            media = MediaFile(
                tenant=tenant,
                name=f"team_{filename}",
                file_type="image",
                uploaded_by=uploaded_by,
                size=photo_path.stat().st_size,
            )
            media.file.save(f"team/{filename}", ContentFile(photo_path.read_bytes()), save=True)
            member.photo = media
            member.save(update_fields=["photo"])
            self.stdout.write(self.style.SUCCESS(f"    [OK] Photo attached: {filename}"))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"    [FAIL] Could not attach photo: {e}"))

    def _download_gallery_images(self, tenant, uploaded_by):
        from apps.cms.models import MediaFile

        # Prefer local files shipped in frontend/public/gallery/
        local_dir = settings.BASE_DIR.parent / GALLERY_LOCAL_DIR
        if local_dir.exists():
            image_files = sorted([
                f for f in local_dir.iterdir()
                if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp')
            ])
            if image_files:
                self.stdout.write(f"  Loading {len(image_files)} gallery images from local files")
                for img_path in image_files:
                    filename = img_path.name
                    if MediaFile.objects.filter(tenant=tenant, name=filename).exists():
                        self.stdout.write(f"  -> Skipping existing: {filename}")
                        continue
                    try:
                        media = MediaFile(
                            tenant=tenant,
                            name=filename,
                            file_type="image",
                            uploaded_by=uploaded_by,
                            size=img_path.stat().st_size,
                        )
                        media.file.save(
                            f"gallery/{filename}",
                            ContentFile(img_path.read_bytes()),
                            save=True,
                        )
                        self.stdout.write(self.style.SUCCESS(f"    [OK] {filename}"))
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"    [FAIL] {filename}: {e}"))
                return  # done — no URL downloads needed

        # Fallback: download from live site URLs
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.umaniehomesafrica.com/",
        }

        for i, url in enumerate(GALLERY_IMAGES):
            filename = url.split("/")[-1]
            if MediaFile.objects.filter(tenant=tenant, name=filename).exists():
                self.stdout.write(f"  -> Skipping existing: {filename}")
                continue
            try:
                self.stdout.write(f"  Downloading gallery image {i+1}/{len(GALLERY_IMAGES)}: {filename}")
                response = requests.get(url, headers=headers, timeout=30)
                if response.status_code == 200:
                    media = MediaFile(
                        tenant=tenant,
                        name=filename,
                        file_type="image",
                        uploaded_by=uploaded_by,
                        size=len(response.content),
                    )
                    media.file.save(f"gallery/{filename}", ContentFile(response.content), save=True)
                    self.stdout.write(self.style.SUCCESS(f"    [OK] Saved"))
                else:
                    self.stdout.write(self.style.WARNING(f"    [FAIL] HTTP {response.status_code}"))
                time.sleep(0.5)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"    [FAIL] {e}"))

    def _load_property_images(self, property_obj, label, fallback_urls):
        """Load property images from local gallery files first, fall back to URL downloads."""
        from apps.properties.models import PropertyImage

        local_filenames = PROPERTY_IMAGES_LOCAL.get(label, [])
        local_dir = settings.BASE_DIR.parent / GALLERY_LOCAL_DIR

        if local_filenames and local_dir.exists():
            self.stdout.write(f"  Loading {len(local_filenames)} {label} images from local files")
            for i, filename in enumerate(local_filenames):
                if PropertyImage.objects.filter(property=property_obj, order=i).exists():
                    continue
                img_path = local_dir / filename
                if not img_path.exists():
                    self.stdout.write(self.style.WARNING(f"    [SKIP] Not found: {filename}"))
                    continue
                try:
                    img = PropertyImage(
                        property=property_obj,
                        caption=f"{property_obj.title} — image {i + 1}",
                        is_primary=(i == 0),
                        order=i,
                    )
                    img.image.save(f"{label}_{filename}", ContentFile(img_path.read_bytes()), save=True)
                    self.stdout.write(self.style.SUCCESS(f"    [OK] {filename}"))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"    [FAIL] {filename}: {e}"))
            return

        # Fallback to URL downloads
        self._download_property_images(property_obj, fallback_urls, label)

    def _download_property_images(self, property_obj, urls, label):
        from apps.properties.models import PropertyImage

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.umaniehomesafrica.com/",
        }

        for i, url in enumerate(urls):
            if PropertyImage.objects.filter(property=property_obj, order=i).exists():
                continue
            try:
                self.stdout.write(f"  Downloading {label} image {i+1}/{len(urls)}: {url.split('/')[-1]}")
                response = requests.get(url, headers=headers, timeout=30)
                if response.status_code == 200:
                    filename = url.split("/")[-1]
                    img = PropertyImage(
                        property=property_obj,
                        caption=f"{property_obj.title} -- image {i+1}",
                        is_primary=(i == 0),
                        order=i,
                    )
                    img.image.save(f"{label}_{filename}", ContentFile(response.content), save=True)
                    self.stdout.write(self.style.SUCCESS(f"    [OK] Saved"))
                else:
                    self.stdout.write(self.style.WARNING(f"    [FAIL] HTTP {response.status_code}"))
                time.sleep(0.5)
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"    [FAIL] Failed: {e}"))
