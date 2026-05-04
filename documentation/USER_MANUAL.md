# UmaineHomes ERP — User Manual

## Table of Contents

1. [Accessing the Platform](#1-accessing-the-platform)
2. [Admin & Dashboard Access — Step by Step](#2-admin--dashboard-access--step-by-step)
3. [Public Website](#3-public-website)
4. [Managing Properties](#4-managing-properties)
5. [CMS — Pages, Blog & Media](#5-cms--pages-blog--media)
6. [CRM — Leads & Tours](#6-crm--leads--tours)
7. [Helpdesk & Live Chat](#7-helpdesk--live-chat)
8. [Team Management](#8-team-management)
9. [Theme Customizer](#9-theme-customizer)
10. [Analytics](#10-analytics)
11. [Financials — Deals, Commissions & Invoices](#11-financials--deals-commissions--invoices)
12. [Notifications & Settings](#12-notifications--settings)
13. [Exporting Your Data](#13-exporting-your-data)
14. [First-Time Setup Checklist](#14-first-time-setup-checklist)

---

## 1. Accessing the Platform

| URL | What it is |
|-----|------------|
| `http://localhost:5173` | Public-facing website |
| `http://localhost:5173/dashboard` | ERP Dashboard (staff login required) |
| `http://localhost:5173/login` | Login page |
| `http://localhost:8000/admin/` | Django super-admin (database-level access) |
| `http://localhost:8000/api/v1/` | REST API (browseable, token-protected) |
| `http://localhost:8000/api/v1/schema/swagger-ui/` | Interactive API documentation (Swagger) |

> **Production:** Replace `localhost` with your actual domain (e.g. `umaniehomesafrica.com`).

---

## 2. Admin & Dashboard Access — Step by Step

There are **two separate login systems** in this platform:

| System | URL | Who uses it | What it does |
|--------|-----|-------------|--------------|
| **Django Admin** | `/admin/` | Platform owner / superuser | Raw database access, creating tenants, managing users |
| **ERP Dashboard** | `/dashboard` | Tenant admins, managers, agents, support | Day-to-day operations: listings, CRM, helpdesk, etc. |

---

### Step 1 — Create the First Superuser (one-time, terminal only)

You cannot log into the system at all until you create the first user. This is done from the command line:

```bash
# Navigate to the backend folder
cd UmaineHomes/backend

# Create the superuser (you will be prompted for username, email, password)
python manage.py createsuperuser
```

**Example session:**
```
Username (leave blank to use 'philip'): admin
Email address: admin@umaniehomesafrica.com
Password: ••••••••
Password (again): ••••••••
Superuser created successfully.
```

> Store these credentials securely. This account has unrestricted access to everything.

---

### Step 2 — Log Into Django Admin (`/admin/`)

1. Visit `http://localhost:8000/admin/`
2. Enter the username and password you just created
3. You will see the Django Admin dashboard

**The Django Admin interface looks like this:**

```
┌─────────────────────────────────────────────────────────────┐
│  Django Administration               [Welcome, admin] [Log out]
├─────────────────────────────────────────────────────────────┤
│  ACCOUNTS                                                    │
│    Users          [+ Add] [Change]                          │
│    User Tenant Roles  [+ Add] [Change]                      │
├─────────────────────────────────────────────────────────────┤
│  TENANTS                                                     │
│    Tenants        [+ Add] [Change]                          │
│    Tenant Domains [+ Add] [Change]                          │
│    Tenant Settings [+ Add] [Change]                         │
├─────────────────────────────────────────────────────────────┤
│  PROPERTIES                                                  │
│    Properties     [+ Add] [Change]                          │
│    Property Images [+ Add] [Change]                         │
├─────────────────────────────────────────────────────────────┤
│  CMS                                                         │
│    Blog Posts     [+ Add] [Change]                          │
│    Pages          [+ Add] [Change]                          │
│    Team Members   [+ Add] [Change]                          │
│    Media Files    [+ Add] [Change]                          │
├─────────────────────────────────────────────────────────────┤
│  ... (all other apps listed here)                           │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 3 — Create a Tenant (your company / a client company)

This is required before anything else works. The system needs to know which company "owns" the data.

1. In Django Admin, click **Tenants → + Add**
2. Fill in:
   - **Name:** `Umanie Homes Africa`
   - **Slug:** `umanie-homes-africa` (auto-fills from name)
   - **Plan:** `starter` (or whatever applies)
   - **Email:** `info@umaniehomesafrica.com`
   - **Phone:** `+233 54 969 5146`
   - **City:** `Tema`
   - **Country:** `Ghana`
3. Click **Save**

---

### Step 4 — Create a Tenant Domain

This tells the system which web address maps to which tenant.

1. Click **Tenant Domains → + Add**
2. Set:
   - **Tenant:** *(select the tenant you just created)*
   - **Domain:** `localhost` *(for local development)*  
     or `umaniehomesafrica.com` *(for production)*
   - **Is Primary:** ✓ checked
3. Click **Save**

> **Why this matters:** When a browser visits `umaniehomesafrica.com`, the platform looks up this table and knows which tenant's data to serve. Without this record, every page returns "No tenant found."

---

### Step 5 — Seed Demo Data (optional, development only)

If you want to pre-populate Umanie Homes Africa with real property data, team members, blog posts, and gallery images from the original website:

```bash
cd UmaineHomes/backend
python manage.py seed_umanie
```

This downloads real property images and creates all the demo content automatically.

---

### Step 6 — Create a Staff User for the ERP Dashboard

The superuser created above can log into `/admin/` but to use the **ERP Dashboard** (`/dashboard`), you need a User with a TenantRole assigned.

**Option A — Create from Django Admin:**
1. Admin → **Users → + Add**
2. Fill in: username, email, first name, last name, password
3. At the bottom of the form, tick **Staff status** if you want `/admin/` access too
4. Click **Save and continue editing**
5. Now go to **User Tenant Roles → + Add**
   - **User:** *(select the user you just made)*
   - **Tenant:** *(select the tenant)*
   - **Role:** `admin` *(for full access)* or `manager`, `agent`, `support`
6. Click **Save**

**Option B — Create from the ERP Dashboard** *(once you're already logged in as admin):*
Go to Dashboard → Team → Add Member → this creates a CMS team member. For a full staff account with login access, use Option A.

---

### Step 7 — Log Into the ERP Dashboard (`/dashboard`)

1. Visit `http://localhost:5173/login`
2. Enter the email and password of the staff user you created
3. You will be redirected to `/dashboard`

**What you see after login:**

```
┌──────────────────────────────────────────────────────────────┐
│ UMANIE.  [Dashboard] [Search...]          [Bell] [View Site] │
├──────────────┬───────────────────────────────────────────────┤
│ MAIN         │                                               │
│  Dashboard   │   Welcome back, Philip                        │
│              │                                               │
│ PROPERTIES   │   ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  Listings    │   │Properties│ │  Leads   │ │ Tickets  │    │
│              │   │    12    │ │    48    │ │    3     │    │
│ CMS          │   └──────────┘ └──────────┘ └──────────┘    │
│  Blog Posts  │                                               │
│  Pages       │   [Lead Funnel Chart]  [Properties by Status] │
│  Media       │                                               │
│              │   Quick Links:                                │
│ CRM          │   ▸ Add Property   ▸ View Leads               │
│  Leads       │   ▸ Helpdesk       ▸ Theme                   │
│  Tours       │                                               │
│  Clients     │                                               │
│              │                                               │
│ HELPDESK     │                                               │
│ TEAM         │                                               │
│ FINANCIALS   │                                               │
│ ANALYTICS    │                                               │
│ THEME        │                                               │
│ SETTINGS     │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

---

### Dashboard Sections — What Each Does

| Section | Path | What you manage |
|---------|------|-----------------|
| **Dashboard** | `/dashboard` | KPI overview, charts, quick links |
| **Properties** | `/dashboard/properties` | Add/edit/delete property listings |
| **Blog Posts** | `/dashboard/cms/blog` | Create and publish blog articles |
| **Pages** | `/dashboard/cms/pages` | Edit static pages (About, Contact, etc.) |
| **Media Library** | `/dashboard/cms/media` | Upload and manage images/documents |
| **Leads** | `/dashboard/crm/leads` | Kanban pipeline — drag leads between stages |
| **Tours** | `/dashboard/crm/tours` | Schedule property viewings |
| **Clients** | `/dashboard/crm/clients` | Client contact directory |
| **Helpdesk** | `/dashboard/helpdesk` | Support tickets + live chat replies |
| **Team** | `/dashboard/team` | Add/edit/remove team members shown on public site |
| **Financials** | `/dashboard/financials` | Deals, commissions, invoices (PDF download) |
| **Analytics** | `/dashboard/analytics` | Traffic, views, lead conversion |
| **Theme** | `/dashboard/theme` | Colors, fonts, logo — no-code branding |
| **Settings** | `/dashboard/settings` | Company info, feature flags, data export |

---

### Role Permissions Summary

| Role | Properties | Leads | CMS | Helpdesk | Team | Financials | Theme |
|------|-----------|-------|-----|----------|------|-----------|-------|
| **Admin** | Full | Full | Full | Full | Full | Full | Full |
| **Manager** | Full | Full | Blog+Media | View | View | Full | — |
| **Agent** | View | Own leads | — | — | — | — | — |
| **Support** | — | — | — | Full | — | — | — |

---

## 3. Public Website

The public site is live at `/` and includes:

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, services, featured properties, team preview, testimonials |
| Properties | `/listings` | Full searchable property catalogue |
| Property Detail | `/listings/:slug` | Photos, specs, inquiry form, agent contact |
| About | `/about` | Company mission and values |
| Team | `/team` | Full team directory |
| Insights / Blog | `/insights` | Published blog posts |
| Gallery | `/gallery` | Photo gallery (images from CMS Media) |
| Contact | `/contact` | Contact form and FAQs |

**Navigating:** Click any property card (anywhere on the card) to open the detail page. The WhatsApp bubble (bottom-left) opens a pre-filled WhatsApp chat. The chat bubble opens the live support chat widget.

---

## 4. Managing Properties

**Path:** Dashboard → Properties (`/dashboard/properties`)

### Adding a Property

1. Click **"Add Property"**
2. Fill in: Title, Type (Villa/Bungalow/Duplex etc.), Status, Listing Type (Sale/Rent), Price + Currency
3. Add address details: Area, City, Country
4. Set bedrooms, bathrooms, sq ft, parking spaces
5. Write a description
6. Toggle **"Featured"** to show it on the homepage
7. Toggle **"Published"** to make it visible on the public site
8. Click **Save**

### Adding Property Images

1. Open the property from the list
2. Scroll to the **Images** section
3. Upload photos (JPEG/PNG recommended, min 1200px wide)
4. Mark one as **Primary** — this appears on listing cards

### Property Statuses

| Status | Meaning |
|--------|---------|
| Available | Shown publicly, can receive inquiries |
| Pending | Under offer — hidden from public by default |
| Sold | Marked as sold, hidden from public |
| Rented | Marked as rented |
| Off Market | Hidden from public |

---

## 5. CMS — Pages, Blog & Media

### Blog Posts (`/dashboard/cms/blog`)

1. Click **"New Post"**
2. Write title, select category, add a featured image
3. Use the rich-text editor (TipTap) for content — supports headings, lists, images, tables, YouTube embeds
4. Set **Published** toggle to make it live
5. Tick **Featured** to pin it to the top of the Insights page

### Pages (`/dashboard/cms/pages`)

Edit static content pages (About, Contact, Home sections). Changes appear immediately on the public site.

### Media Library (`/dashboard/cms/media`)

- Drag and drop images/documents/videos to upload
- All uploads are available for use in blog posts, property images, and team profiles
- Images uploaded here also populate the **Gallery** page automatically

---

## 6. CRM — Leads & Tours

### Leads Board (`/dashboard/crm/leads`)

Every inquiry submitted via the public site (property inquiry form, contact form) creates a Lead automatically.

**Lead statuses (Kanban columns):**

| Status | Meaning |
|--------|---------|
| New | Just came in, not yet contacted |
| Contacted | Agent has reached out |
| Viewing | Property viewing scheduled |
| Offer | Offer made |
| Closed (Won) | Deal completed |
| Lost | Lead went cold or chose elsewhere |

**To move a lead:** Drag the card between columns, or open it and click a stage button to change status.

**To add a lead manually:** Click "Add Lead" button (top right), fill in contact details.

### Tour Scheduler (`/dashboard/crm/tours`)

Schedule property viewings directly from a lead's detail page or from the Tours calendar.

---

## 7. Helpdesk & Live Chat

### Tickets (`/dashboard/helpdesk`)

Support tickets are created when:
- A client submits the contact form
- A live chat session starts (auto-creates a linked ticket)
- An agent manually creates one (click **"New Ticket"**)

Select a ticket to view its details. Change **Status** and **Priority** using the dropdowns directly in the detail panel — saves automatically.

### Live Chat (`/dashboard/helpdesk`)

- **Client side:** The chat bubble (bottom-left of every page) opens the live chat widget
- **Agent side:** Select a ticket with a chat session, click **"Connect to Chat"**, then reply in the message box
- Messages delivered via WebSocket — no page refresh needed
- Chat history saved to the database

> **Requires Redis:** Make sure Redis is running for live chat to work.

---

## 8. Team Management

**Path:** Dashboard → Team (`/dashboard/team`)

### Adding a Team Member

1. Click **"Add Member"**
2. Click the avatar circle to upload a profile photo
3. Fill in: Full Name *(required)*, Role/Title *(required)*, Bio, Years of Experience
4. Add contact details: email, phone, LinkedIn URL, Twitter/X URL
5. Set Display Order (lower number = shown first on the public page)
6. Toggle **Active** to show on the public team page
7. Click **Save Member**

Team members appear on the public `/team` page and in property listing agent cards.

---

## 9. Theme Customizer

**Path:** Dashboard → Theme (`/dashboard/theme`)

Customize the entire public website's visual identity without touching any code:

| Setting | What it controls |
|---------|-----------------|
| Primary Color | Nav, buttons, links, headings accent |
| Accent Color | Gold highlights, dividers, hover states |
| Background Color | Page background |
| Nav Background | Navigation bar color |
| Footer Background | Footer section color |
| Font Family (Heading) | H1–H6 font (Google Fonts) |
| Font Family (Body) | Paragraph text font |
| Logo | Company logo (shown in navbar and footer) |
| Favicon | Browser tab icon — **auto-generated from logo if left blank** |
| Custom CSS | Advanced: inject any custom CSS |

**Logo → Favicon auto-generation:** When you upload a logo, the system automatically crops it to a square and generates a 32×32 PNG favicon. No separate favicon upload needed.

Changes apply live to the public site within seconds of saving.

---

## 10. Analytics

**Path:** Dashboard → Analytics (`/dashboard/analytics`)

Tracks:
- **Property views** — which listings are getting traffic
- **Lead funnel** — conversion rates from view → inquiry → closed
- **Page views** — which pages are most visited
- **Top performing properties** — by views and inquiry count

Data is tracked automatically — no setup required.

---

## 11. Financials — Deals, Commissions & Invoices

**Path:** Dashboard → Financials (`/dashboard/financials`)

### Deals

1. Click **"New Deal"** (visible on the Deals tab)
2. Select deal type (Sale / Rent / Lease)
3. Set deal value, currency, commission rate
4. Commission amount is calculated automatically
5. Update the deal **Status** using the dropdown directly in the table row

### Commissions

Track agent commissions per deal. Commissions are auto-created when a deal is completed. The tracker shows pending vs. paid.

### Invoices

1. Click **"New Invoice"** (visible on the Invoices tab)
2. Fill in client name, email, total amount, due date
3. Update **Status** (Pending → Approved → Paid) directly in the table
4. Click **"PDF"** button to generate and download a formatted invoice

---

## 12. Notifications & Settings

### Email Notifications (Mailtrap)

In development, all emails are intercepted by **Mailtrap**:
1. Log in at `mailtrap.io`
2. Open your inbox — all emails appear there

In production, swap credentials in `.env`:
```
EMAIL_HOST=smtp.sendgrid.net        # or smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-real-password
DEFAULT_FROM_EMAIL=info@yourdomain.com
```

### Tenant Settings (`/dashboard/settings`)

Configure company info, feature flags, and social links. You can also **export all your data** from this page (see Section 13).

---

## 13. Exporting Your Data

**Path:** Dashboard → Settings → Data Export section

Every tenant admin can export a complete copy of their data at any time — properties, leads, team, blog posts, media files, and more.

### How to Export

1. Go to `Dashboard → Settings`
2. Scroll to the **"Data Export"** section at the bottom
3. Click **"Export All Data"**
4. A spinner appears: *"Preparing your export…"* — this runs in the background and takes 30–120 seconds depending on how many files you have
5. When ready, a **"Download ZIP"** button appears
6. Click it to download your export archive

### What's Inside the ZIP

```
umanie-homes-africa_export_2026-04-27/
├── data/
│   ├── properties.json      ← all your listings + details
│   ├── leads.json           ← all CRM leads + notes
│   ├── team.json            ← team member profiles
│   ├── blog_posts.json      ← all published + draft posts
│   ├── pages.json           ← CMS pages content
│   ├── media_files.json     ← media library metadata
│   ├── deals.json           ← deals + commission records
│   ├── invoices.json        ← invoice records
│   └── settings.json        ← your company settings + theme config
└── media/
    ├── properties/          ← all property photos
    ├── team/                ← team member photos
    ├── gallery/             ← gallery images
    └── media_library/       ← all uploaded media files
```

> **Note:** The download link expires after 24 hours. Re-trigger the export if needed.

---

## 14. First-Time Setup Checklist

Use this when setting up a new tenant / fresh deployment:

### Backend Setup
- [ ] Run `python manage.py migrate` to create database tables
- [ ] Run `python manage.py createsuperuser` to create the first admin account
- [ ] Visit `/admin/` and log in with the superuser credentials
- [ ] Create a **Tenant** record (company name, slug, contact info)
- [ ] Create a **TenantDomain** record pointing your domain to that tenant
- [ ] (Optional) Run `python manage.py seed_umanie` to populate demo data

### Dashboard Setup
- [ ] Visit `/login` and log in with a staff user account
- [ ] Go to **Theme** — upload your company logo
- [ ] Verify the favicon was auto-generated (check browser tab)
- [ ] Go to **Settings** — fill in company address, phone, business hours
- [ ] Add your team members in **Team** (with photos)
- [ ] Add your property listings in **Properties** (mark at least 3 as Featured)
- [ ] Upload gallery photos in **Media Library**
- [ ] Write your first blog post in **CMS → Blog**

### Testing
- [ ] Test the inquiry form on a property listing → check it appears in CRM → Leads
- [ ] Test the live chat widget → check it appears in Helpdesk
- [ ] Confirm emails appear in Mailtrap (development) or your SMTP inbox (production)
- [ ] Test the data export (Settings → Export All Data)

### Production Checklist (when going live)
- [ ] Set `DEBUG=False` in `.env`
- [ ] Set `ALLOWED_HOSTS=yourdomain.com` in `.env`
- [ ] Set `CORS_ALLOWED_ORIGINS=https://yourdomain.com` in `.env`
- [ ] Update TenantDomain from `localhost` to your real domain
- [ ] Configure real SMTP credentials in `.env`
- [ ] Point your domain's DNS to the server IP
- [ ] Set `USE_S3=True` and fill in S3/Spaces credentials in `.env` (see DEPLOYMENT.md)
- [ ] Run `python manage.py collectstatic`

---

## Quick Reference

| Action | Where |
|--------|-------|
| Create first admin user | Terminal: `python manage.py createsuperuser` |
| Raw database access | `/admin/` with superuser |
| Create a new tenant | `/admin/` → Tenants → + Add |
| Map a domain to a tenant | `/admin/` → Tenant Domains → + Add |
| Log into ERP dashboard | `/login` with staff email + password |
| Add a property | Dashboard → Properties → Add Property |
| View incoming leads | Dashboard → CRM → Leads |
| Reply to support chat | Dashboard → Helpdesk → select ticket → Connect |
| Change site colors/logo | Dashboard → Theme |
| Export all data | Dashboard → Settings → Export All Data |
| View API documentation | `/api/v1/schema/swagger-ui/` |

---

*For deployment instructions see [DEPLOYMENT.md](DEPLOYMENT.md). For the technical architecture see [README.md](README.md).*
