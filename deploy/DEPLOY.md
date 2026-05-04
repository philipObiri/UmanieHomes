# VPS Deployment Guide — Ubuntu 22.04 + Nginx + Supervisor

This is a bare-metal (no Docker) deployment. Nginx serves static + media files
directly from disk. Gunicorn + Celery run as system services managed by Supervisor.

---

## 1. Provision Your VPS

- **Minimum spec:** 2 vCPU, 4 GB RAM, 80 GB SSD (Ubuntu 22.04)
- Point all tenant domain DNS A records to the VPS IP.
- Open ports **80** and **443** in your firewall.

---

## 2. Initial Server Setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip \
    postgresql postgresql-contrib redis-server \
    nginx supervisor certbot python3-certbot-nginx \
    build-essential libpq-dev libcairo2 libpango-1.0-0 \
    libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev \
    shared-mime-info git

# Create app user (optional, better than running as ubuntu)
sudo adduser umanie --disabled-password --gecos ""
sudo usermod -aG sudo umanie
```

---

## 3. PostgreSQL Setup

```bash
sudo -u postgres psql
CREATE DATABASE realestate_erp;
CREATE USER umanie WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE realestate_erp TO umanie;
\q
```

---

## 4. Clone & Install

```bash
mkdir -p /home/ubuntu/umanie
cd /home/ubuntu/umanie
git clone https://github.com/YOUR_ORG/umanie-homes.git .

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python deps
pip install --upgrade pip
pip install -r backend/requirements/production.txt
```

---

## 5. Environment Variables

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Set at minimum:
```
SECRET_KEY=<generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())">
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,tenant2.com,*.yourplatform.com
DATABASE_URL=postgres://umanie:STRONG_PASSWORD_HERE@localhost:5432/realestate_erp
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
USE_S3=False
MEDIA_ROOT=/home/ubuntu/umanie/backend/media
MEDIA_URL=/media/
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://tenant2.com
```

---

## 6. Django Setup

```bash
cd /home/ubuntu/umanie/backend
source ../venv/bin/activate

export DJANGO_SETTINGS_MODULE=config.settings.production

python manage.py migrate
python manage.py collectstatic --noinput

# Create log directory
sudo mkdir -p /var/log/umanie
sudo chown ubuntu:ubuntu /var/log/umanie

# Create your first superuser
python manage.py createsuperuser
```

---

## 7. Nginx Configuration

```bash
# Copy Nginx config
sudo cp /home/ubuntu/umanie/deploy/nginx/umanie.conf /etc/nginx/sites-available/umanie
sudo ln -s /etc/nginx/sites-available/umanie /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # remove default site

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. SSL (Let's Encrypt — one command per domain)

```bash
# For each tenant domain:
sudo certbot --nginx -d yourdomain.com
sudo certbot --nginx -d tenant2.com
# Certbot automatically edits the Nginx config and sets up renewal
```

---

## 9. Supervisor (Process Manager)

```bash
# Copy config
sudo cp /home/ubuntu/umanie/deploy/supervisor/umanie.conf /etc/supervisor/conf.d/umanie.conf

# Edit paths if you changed the install directory
sudo nano /etc/supervisor/conf.d/umanie.conf

# Load and start all services
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start umanie:*
```

---

## 10. Day-to-Day Supervisor Commands

```bash
# Check status of all services
sudo supervisorctl status

# Restart everything (e.g. after a deploy)
sudo supervisorctl restart umanie:*

# Restart only Gunicorn
sudo supervisorctl restart umanie-gunicorn

# View live logs
sudo tail -f /var/log/umanie/gunicorn.log
sudo tail -f /var/log/umanie/celery.log

# Stop all
sudo supervisorctl stop umanie:*
```

---

## 11. Deploying Updates

```bash
cd /home/ubuntu/umanie
git pull origin main

source venv/bin/activate
cd backend
export DJANGO_SETTINGS_MODULE=config.settings.production

pip install -r requirements/production.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Restart services
sudo supervisorctl restart umanie:*
```

---

## 12. Onboarding a New Tenant

1. Point the tenant's domain DNS A record → your VPS IP.
2. Log in to `/admin/` → **Tenants** → **Add Tenant** → fill in name, slug, contact info.
3. Under that tenant → **Tenant Domains** → **Add** → enter `theirdomain.com`, check **Is Primary**.
4. Run Certbot for their domain: `sudo certbot --nginx -d theirdomain.com`
5. Visit `https://theirdomain.com` — they now see a completely isolated, branded dashboard.

---

## 13. Media Files

Uploaded files are stored at `/home/ubuntu/umanie/backend/media/`.  
Nginx serves them at `/media/` via the `alias` directive in the Nginx config.  
**No S3 required.** Back up the `media/` directory periodically (e.g., with `rsync` to another server).

---

## 14. Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```
