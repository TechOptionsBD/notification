help:
	@echo ''
	@echo 'Usage: make [TARGET] [EXTRA_ARGUMENTS]'
	@echo 'Targets:'
	@echo 'make dev: make dev for development work'
	@echo 'make build: make build container'
	@echo 'make prod: docker production build'
	@echo 'clean: clean for all clear docker images'


dev:
	docker-compose -f docker-compose.yml down
	docker-compose -f docker-compose.yml up

prod:
	docker-compose-prod.yml down
	docker-compose-prod.yml up --build

clean:
	docker-compose down -v
	docker-compose -f docker-compose.yml down -v
