# ⚖ LexDesk Pro

Sistema de gestión integral para despachos de abogados.

## Requisitos
- Node.js 20+
- Docker + Docker Compose
- PostgreSQL 16 (o via Docker)

## Arranque rápido
```bash
cp .env.example .env        # rellenar variables
docker-compose up -d        # arranca postgres + redis
cd backend && npm install && npm run migrate && npm run dev
cd frontend && npm install && npm run dev
```

## Estructura
- `frontend/`  — React 18 + Vite + Redux Toolkit
- `backend/`   — Node.js + Express + Sequelize + PostgreSQL
- `workers/`   — LexNet scraper (Playwright) + WhatsApp bot
