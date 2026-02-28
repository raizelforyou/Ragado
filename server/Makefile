.PHONY: help up down restart build logs shell db-shell redis-shell migrate migrate-new migrate-down reset clean test lint format install dev prod

# Colors
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

# Docker compose command (use docker-compose for older versions)
DOCKER_COMPOSE := docker-compose

# Default target
.DEFAULT_GOAL := help

## Help
help: ## Show this help
	@echo ''
	@echo 'Usage:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${YELLOW}%-15s${GREEN}%s${RESET}\n", $$1, $$2}' $(MAKEFILE_LIST)

## Docker Development Commands
up: ## Start all services (dev)
	$(DOCKER_COMPOSE) up -d

up-build: ## Build and start all services (dev)
	$(DOCKER_COMPOSE) up -d --build

down: ## Stop all services
	$(DOCKER_COMPOSE) down

restart: ## Restart all services
	$(DOCKER_COMPOSE) restart

build: ## Build images
	$(DOCKER_COMPOSE) build

logs: ## View logs (all services)
	$(DOCKER_COMPOSE) logs -f

logs-backend: ## View backend logs
	$(DOCKER_COMPOSE) logs -f backend

logs-postgres: ## View postgres logs
	$(DOCKER_COMPOSE) logs -f postgres

logs-redis: ## View redis logs
	$(DOCKER_COMPOSE) logs -f redis

## Production Commands
prod: ## Start all services (production)
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d

prod-build: ## Build and start all services (production)
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d --build

prod-down: ## Stop production services
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml down

prod-logs: ## View production logs
	$(DOCKER_COMPOSE) -f docker-compose.prod.yml logs -f

## Shell Access
shell: ## Access backend container shell
	$(DOCKER_COMPOSE) exec backend /bin/bash

db-shell: ## Access PostgreSQL shell
	$(DOCKER_COMPOSE) exec postgres psql -U postgres -d ragado

redis-shell: ## Access Redis CLI
	$(DOCKER_COMPOSE) exec redis redis-cli

## Database & Migrations
migrate: ## Run database migrations
	$(DOCKER_COMPOSE) exec -T backend alembic upgrade head

migrate-new: ## Create new migration (usage: make migrate-new MSG="migration message")
	$(DOCKER_COMPOSE) exec -T backend alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Rollback last migration
	$(DOCKER_COMPOSE) exec -T backend alembic downgrade -1

migrate-history: ## Show migration history
	$(DOCKER_COMPOSE) exec -T backend alembic history

migrate-current: ## Show current migration
	$(DOCKER_COMPOSE) exec -T backend alembic current

db-reset: ## Reset database (drop and recreate)
	$(DOCKER_COMPOSE) down -v postgres_data
	$(DOCKER_COMPOSE) up -d postgres
	@echo "Waiting for postgres to be ready..."
	@sleep 5
	$(DOCKER_COMPOSE) up -d backend
	@sleep 5
	$(MAKE) migrate

## Reset & Clean
reset: ## Reset everything (containers, volumes, images)
	$(DOCKER_COMPOSE) down -v --rmi local
	$(DOCKER_COMPOSE) up -d --build

clean: ## Remove all containers, volumes, and images
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	docker system prune -f

## Testing & Quality
test: ## Run tests
	$(DOCKER_COMPOSE) exec -T backend pytest -v

test-cov: ## Run tests with coverage
	$(DOCKER_COMPOSE) exec -T backend pytest -v --cov=. --cov-report=html

lint: ## Run linter
	$(DOCKER_COMPOSE) exec -T backend ruff check .

format: ## Format code
	$(DOCKER_COMPOSE) exec -T backend black .
	$(DOCKER_COMPOSE) exec -T backend ruff check --fix .

## Local Development (without Docker)
install: ## Install dependencies locally
	poetry install

dev-local: ## Run locally (without Docker)
	poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

migrate-local: ## Run migrations locally (without Docker)
	poetry run alembic upgrade head

## Health Checks
health: ## Check service health
	@echo "Backend Health:"
	@curl -s http://localhost:8000/health | python3 -m json.tool || echo "Backend not healthy"
	@echo "\nBackend Readiness:"
	@curl -s http://localhost:8000/health/ready | python3 -m json.tool || echo "Backend not ready"

status: ## Show container status
	$(DOCKER_COMPOSE) ps

## Utility
env: ## Copy .env.example to .env
	cp -n .env.example .env || echo ".env already exists"

env-prod: ## Copy .env.prod.example to .env.prod
	cp -n .env.prod.example .env.prod || echo ".env.prod already exists"
