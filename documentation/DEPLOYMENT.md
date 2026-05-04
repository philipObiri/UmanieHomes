# Deployment Guide

This guide covers running the project locally for development and deploying it to a Ubuntu VPS for production.

The stack is:
- **Backend** — Django 5 + Django Channels (ASGI), served by Uvicorn behind Gunicorn
- **Frontend** — React + Vite (built to static files, served by Nginx)
- **Database** — PostgreSQL 15
- **Cache / Broker / Channel Layer** — Redis 7
- **Process manager** — Supervisor (supervisorctl)
- **Reverse proxy** — Nginx

---

## Part 1 — Local Development

### Prerequisites

Make sure you have these installed on your machine:

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11+ | `python --version` |
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Redis | 7+ | Must be running on port 6379 |
| Git | any | |

> **Windows note:** Redis is easiest to run via [WSL2](https://redis.io/docs/install/install-redis/install-redis-on-windows/) or [Memurai](https://www.memurai.com/). Alternatively, install the [Redis Windows port](https://github.com/tporadowski/redis/releases).

> **Database:** The development settings default to **SQLite** (no PostgreSQL needed locally). If you want PostgreSQL locally, set `DATABASE_URL` in your `.env` file.

---

### 1.1 Clone the repository

```bash
git clone https://github.com/your-org/umaine-homes.git
cd umaine-homes
```

---

### 1.2 Backend setup

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# macOS / Linux:
source venv/bin/activate
# Windows (Command Prompt):
venv\Scripts\activate.bat
# Windows (PowerShell):
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements/development.txt
```

**Create your local `.env` file:**

```bash
cp ../.env.example .env   # if the example exists, otherwise create it manually
```

Minimum `.env` for local development:

```env
SECRET_KEY=local-dev-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Leave DATABASE_URL blank to use SQLite (default)
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/realestate_erp

REDIS_URL=redis://localhost:6379/0

# Email — prints to console in dev when these are blank
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

**Run migrations and seed data:**

```bash
python manage.py migrate --settings=config.settings.development

# Seed Umanie Homes Africa as Tenant #1 (downloads all property + gallery images)
python manage.py seed_umanie --settings=config.settings.development

# To skip image downloads (faster, no internet required):
python manage.py seed_umanie --skip-images --settings=config.settings.development
```

**Start the backend development server:**

```bash
python manage.py runserver --settings=config.settings.development
```

The API is now at: `http://localhost:8000/api/v1/`
Django Admin: `http://localhost:8000/admin/`
Admin credentials: `admin@umaniehomesafrica.com` / `UmanieAdmin2025!`

> **WebSockets** also work through the dev server because Django's `runserver` uses ASGI in development when `ASGI_APPLICATION` is set.

---

### 1.3 Frontend setup

Open a **second terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Copy the env file
cp .env.example .env   # or create .env manually
```

`.env` contents:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_MEDIA_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

**Start the frontend dev server:**

```bash
npm run dev
```

The app is now at: `http://localhost:5173`

---

### 1.4 (Optional) Run Celery for background tasks

Open a **third terminal**:

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

celery -A config worker --loglevel=info
```

This is only needed if you're testing email notifications, PDF generation, or other async tasks.

---

### 1.5 Development summary

| Service | Command | URL |
|---------|---------|-----|
| Backend API | `python manage.py runserver --settings=config.settings.development` | `http://localhost:8000` |
| Frontend | `npm run dev` | `http://localhost:5173` |
| Celery worker | `celery -A config worker --loglevel=info` | (background) |

---

---

## Part 2 — Production Deployment on Ubuntu VPS

Tested on **Ubuntu 22.04 LTS**. Run all commands as a non-root user with `sudo` access (e.g. `deploy`).

---

### 2.1 Provision the server

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install system dependencies
sudo apt install -y \
  python3.11 python3.11-venv python3-pip \
  postgresql postgresql-contrib \
  redis-server \
  nginx \
  supervisor \
  git \
  curl \
  build-essential \
  libpq-dev \
  python3.11-dev

# Install Node.js 20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### 2.2 Create a system user

```bash
sudo adduser --system --group --shell /bin/bash deploy
sudo mkdir -p /var/www/umaine
sudo chown deploy:deploy /var/www/umaine
```

---

### 2.3 Set up PostgreSQL

```bash
sudo -u postgres psql

-- Inside psql:
CREATE DATABASE umaine_prod;
CREATE USER umaine_user WITH PASSWORD 'choose-a-strong-password';
ALTER ROLE umaine_user SET client_encoding TO 'utf8';
ALTER ROLE umaine_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE umaine_user SET timezone TO 'Africa/Accra';
GRANT ALL PRIVILEGES ON DATABASE umaine_prod TO umaine_user;
\q
```

---

### 2.4 Clone the repository

```bash
sudo -u deploy -i
cd /var/www/umaine
git clone https://github.com/your-org/umaine-homes.git .
```

---

### 2.5 Backend setup

```bash
cd /var/www/umaine/backend

python3.11 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements/base.txt

# Install WhiteNoise (static files in production)
pip install whitenoise
```

**Create the production `.env` file:**

```bash
nano /var/www/umaine/backend/.env
```

```env
SECRET_KEY=generate-a-long-random-string-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

DATABASE_URL=postgres://umaine_user:choose-a-strong-password@localhost:5432/umaine_prod

REDIS_URL=redis://127.0.0.1:6379/0
CELERY_BROKER_URL=redis://127.0.0.1:6379/0
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/0

MEDIA_URL=/media/
MEDIA_ROOT=/var/www/umaine/backend/media

# Email (Mailtrap or your SMTP provider)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_HOST_USER=your-mailtrap-user
EMAIL_HOST_PASSWORD=your-mailtrap-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

PLATFORM_DOMAIN=yourdomain.com
```

**Generate a strong SECRET_KEY:**

```bash
python -c "import secrets; print(secrets.token_urlsafe(60))"
```

**Run migrations, collect static files, and seed data:**

```bash
cd /var/www/umaine/backend
source venv/bin/activate

python manage.py migrate --settings=config.settings.production
python manage.py collectstatic --noinput --settings=config.settings.production
python manage.py seed_umanie --settings=config.settings.production
```

---

### 2.6 Build the frontend

```bash
cd /var/www/umaine/frontend

npm ci  # clean install from lockfile

# Create production .env
cat > .env.production << 'EOF'
VITE_API_URL=https://yourdomain.com/api/v1
VITE_MEDIA_URL=https://yourdomain.com
VITE_WS_URL=wss://yourdomain.com
EOF

npm run build
# Output is at: /var/www/umaine/frontend/dist
```

---

### 2.7 Set directory permissions

```bash
sudo chown -R deploy:www-data /var/www/umaine
sudo chmod -R 755 /var/www/umaine
sudo chmod -R 775 /var/www/umaine/backend/media
sudo chmod -R 755 /var/www/umaine/frontend/dist
```

---

### 2.8 Supervisor — manage Django, Celery worker, Celery beat

Supervisor keeps all three processes running and restarts them on crash or server reboot.

**Create the Gunicorn/Uvicorn config for Django:**

```bash
sudo nano /etc/supervisor/conf.d/umaine-django.conf
```

```ini
[program:umaine-django]
command=/var/www/umaine/backend/venv/bin/gunicorn config.asgi:application
    --worker-class uvicorn.workers.UvicornWorker
    --workers 4
    --bind 127.0.0.1:8000
    --timeout 120
    --access-logfile /var/log/umaine/django-access.log
    --error-logfile /var/log/umaine/django-error.log
directory=/var/www/umaine/backend
user=deploy
environment=DJANGO_SETTINGS_MODULE="config.settings.production"
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/umaine/django-supervisor.log
stdout_logfile=/var/log/umaine/django-supervisor.log
```

**Celery worker:**

```bash
sudo nano /etc/supervisor/conf.d/umaine-celery.conf
```

```ini
[program:umaine-celery]
command=/var/www/umaine/backend/venv/bin/celery
    -A config worker
    --loglevel=info
    --concurrency=4
    --logfile=/var/log/umaine/celery-worker.log
directory=/var/www/umaine/backend
user=deploy
environment=DJANGO_SETTINGS_MODULE="config.settings.production"
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/umaine/celery-supervisor.log
stdout_logfile=/var/log/umaine/celery-supervisor.log
```

**Celery beat (scheduled tasks):**

```bash
sudo nano /etc/supervisor/conf.d/umaine-celerybeat.conf
```

```ini
[program:umaine-celerybeat]
command=/var/www/umaine/backend/venv/bin/celery
    -A config beat
    --loglevel=info
    --logfile=/var/log/umaine/celery-beat.log
    --pidfile=/tmp/celerybeat.pid
directory=/var/www/umaine/backend
user=deploy
environment=DJANGO_SETTINGS_MODULE="config.settings.production"
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/umaine/celerybeat-supervisor.log
stdout_logfile=/var/log/umaine/celerybeat-supervisor.log
```

**Create the log directory and start everything:**

```bash
sudo mkdir -p /var/log/umaine
sudo chown deploy:deploy /var/log/umaine

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

**Check status:**

```bash
sudo supervisorctl status
```

Expected output:
```
umaine-celery       RUNNING   pid 12345, uptime 0:00:05
umaine-celerybeat   RUNNING   pid 12346, uptime 0:00:05
umaine-django       RUNNING   pid 12347, uptime 0:00:05
```

---

### 2.9 Nginx

Nginx serves:
- `/` → frontend static files from `frontend/dist`
- `/api/v1/` → proxied to Gunicorn on port 8000
- `/ws/` → proxied with WebSocket upgrade headers
- `/media/` → served directly from `backend/media`
- `/static/` → served directly from `backend/staticfiles`

```bash
sudo nano /etc/nginx/sites-available/umaine
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL — replace with your cert paths (e.g. from Certbot)
    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    # ── Frontend (React SPA) ──────────────────────────────────────────────
    root /var/www/umaine/frontend/dist;
    index index.html;

    # All non-API, non-asset requests fall through to index.html (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── Django REST API ───────────────────────────────────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 120;
    }

    # ── Django Admin ─────────────────────────────────────────────────────
    location /admin/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # ── WebSockets (Django Channels) ──────────────────────────────────────
    location /ws/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_read_timeout 86400;  # keep WebSocket connections alive
    }

    # ── Static files (Django collectstatic) ──────────────────────────────
    location /static/ {
        alias /var/www/umaine/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # ── Media files (user uploads) ────────────────────────────────────────
    location /media/ {
        alias /var/www/umaine/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # ── Security headers ──────────────────────────────────────────────────
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

**Enable the site and test:**

```bash
sudo ln -s /etc/nginx/sites-available/umaine /etc/nginx/sites-enabled/
sudo nginx -t          # must print "syntax is ok"
sudo systemctl reload nginx
```

---

### 2.10 SSL with Certbot (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot automatically edits your nginx config and sets up auto-renewal.

---

### 2.11 Enable services on boot

```bash
sudo systemctl enable nginx
sudo systemctl enable redis-server
sudo systemctl enable postgresql
sudo systemctl enable supervisor
```

---

### 2.12 Production deployment summary

| Layer | Tool | Config file |
|-------|------|------------|
| Process manager | Supervisor | `/etc/supervisor/conf.d/umaine-*.conf` |
| ASGI server | Gunicorn + Uvicorn workers | supervisor config |
| Background tasks | Celery worker + beat | supervisor config |
| Reverse proxy | Nginx | `/etc/nginx/sites-available/umaine` |
| Database | PostgreSQL 15 | managed by `pg_ctlcluster` |
| Cache / broker | Redis 7 | `/etc/redis/redis.conf` |
| SSL | Certbot / Let's Encrypt | `/etc/letsencrypt/live/yourdomain.com/` |
| Frontend | Static files | `/var/www/umaine/frontend/dist` |

---

### 2.13 Deploying updates

Run this after every `git pull`:

```bash
cd /var/www/umaine

# Pull latest code
git pull origin main

# Backend — migrate and recollect static
cd backend
source venv/bin/activate
pip install -r requirements/base.txt          # in case new packages were added
python manage.py migrate --settings=config.settings.production
python manage.py collectstatic --noinput --settings=config.settings.production

# Frontend — rebuild
cd ../frontend
npm ci
npm run build

# Restart Django and Celery
sudo supervisorctl restart umaine-django umaine-celery umaine-celerybeat

# Nginx does not need a restart unless you changed its config
```

---

### 2.14 Useful commands

```bash
# Check all process statuses
sudo supervisorctl status

# Restart a single process
sudo supervisorctl restart umaine-django

# Tail live logs
tail -f /var/log/umaine/django-error.log
tail -f /var/log/umaine/celery-worker.log

# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Open Django shell on the server
cd /var/www/umaine/backend
source venv/bin/activate
python manage.py shell --settings=config.settings.production

# Create a superuser manually (if needed)
python manage.py createsuperuser --settings=config.settings.production

# Check PostgreSQL connection
psql -U umaine_user -d umaine_prod -h localhost
```

---

### 2.15 VAPID Push Notifications Setup

Web Push notifications require VAPID keys. Generate them once and store them permanently.

**Generate keys (run once in the backend venv):**

```bash
cd /var/www/umaine/backend
source venv/bin/activate

python -c "
import base64
from py_vapid import Vapid
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat

vapid = Vapid()
vapid.generate_keys()

private_b64 = base64.b64encode(vapid.private_pem()).decode()
raw_public = vapid.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
public_b64url = base64.urlsafe_b64encode(raw_public).rstrip(b'=').decode()

print('VAPID_PRIVATE_KEY=' + private_b64)
print('VAPID_PUBLIC_KEY=' + public_b64url)
"
```

Add the printed values to `backend/.env`:

```env
VAPID_PRIVATE_KEY=<base64-encoded-private-key>
VAPID_PUBLIC_KEY=<urlsafe-base64-public-key>
```

And to `frontend/.env`:

```env
VITE_VAPID_PUBLIC_KEY=<same-urlsafe-base64-public-key>
```

Then restart the Django process:

```bash
sudo supervisorctl restart umaine-django
```

**How it works:**
- When a user visits the site, the service worker (`/sw.js`) is registered automatically
- After 5 seconds, the browser prompts for notification permission
- If granted, the subscription is POST'd to `/api/v1/notifications/push-subscriptions/`
- When any `Notification` record is created in the database, Celery sends a web push to all the recipient's registered devices via `pywebpush`
- Expired subscriptions (HTTP 404/410) are automatically deleted from the database
