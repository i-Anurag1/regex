install:
	python -m pip install -r backend/requirements.txt

backend-test:
	cd backend && pytest -q

backend-check:
	python -m compileall -q backend/app

frontend-install:
	cd frontend && npm ci

frontend-build:
	cd frontend && npm run build

frontend-test:
	cd frontend && npm test -- --run

frontend-lint:
	cd frontend && npm run lint

docker-up:
	docker compose up --build

check: backend-test backend-check frontend-build frontend-test frontend-lint
