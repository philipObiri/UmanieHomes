.PHONY: dev build deploy migrate seed logs shell test

# ── Development ──────────────────────────────────────────────────────────────
dev:
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml up --build

dev-down:
	docker-compose -f docker-compose.dev.yml down

# ── Production ────────────────────────────────────────────────────────────────
build:
	docker build -t umanie-backend ./backend

deploy:
	docker-compose pull && docker-compose up -d --no-deps backend celery celery-beat

deploy-full:
	docker-compose up -d --build

down:
	docker-compose down

# ── Database ──────────────────────────────────────────────────────────────────
migrate:
	docker-compose exec backend python manage.py migrate

migrate-dev:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate

seed:
	docker-compose exec backend python manage.py seed_umanie

seed-dev:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py seed_umanie

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

# ── Utilities ─────────────────────────────────────────────────────────────────
logs:
	docker-compose logs -f backend

logs-celery:
	docker-compose logs -f celery

shell:
	docker-compose exec backend python manage.py shell

shell-dev:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py shell

test:
	docker-compose -f docker-compose.dev.yml exec backend python manage.py test

collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput
