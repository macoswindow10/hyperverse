# HyperVerse Cloud

Production-grade VPS management panel. Phase 1 ships a runnable backend foundation plus frontend and agent shells for the next phases.

## Complete file tree

```text
hyperverse-cloud/
├── agent/
│   ├── src/env.ts
│   ├── src/server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── prisma/migrations/20260618161000_init/migration.sql
│   ├── prisma/schema.prisma
│   ├── src/app.ts
│   ├── src/config/{env,prisma,redis}.ts
│   ├── src/controllers/{auth,user}.controller.ts
│   ├── src/middleware/{activityLogger,auth,errorHandler,validate}.ts
│   ├── src/routes/{auth,health,user}.routes.ts
│   ├── src/services/{auth,user}.service.ts
│   ├── src/socket/index.ts
│   ├── src/types/express.d.ts
│   ├── src/utils/{http,jwt,password,tokens}.ts
│   ├── src/validators/{auth,user}.validator.ts
│   ├── .env.example
│   ├── .prettierrc
│   ├── eslint.config.js
│   ├── package.json
│   └── tsconfig.json
├── database/README.md
├── docker/
│   ├── Dockerfile.agent
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── docker-compose.yml
├── docs/
└── frontend/
    ├── src/app/{dashboard,login,profile,register}/page.tsx
    ├── src/app/{globals.css,layout.tsx,page.tsx}
    ├── src/components/{app-shell,auth-card,sidebar,theme-toggle}.tsx
    ├── src/lib/{auth,config,socket}.ts
    ├── src/types/auth.ts
    ├── .env.example
    ├── next-env.d.ts
    ├── next.config.ts
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

## Backend features

- Strict TypeScript, ESLint, and Prettier configuration.
- Express service/controller architecture with Helmet, CORS, rate limiting, and request logging.
- Zod validation for environment variables and request payloads.
- Prisma/PostgreSQL schema and initial SQL migration.
- User model, JWT access tokens, rotating refresh tokens, bcrypt password hashing, Discord OAuth2 login, logout, and `/me`.
- Role hierarchy with admin user-management routes.
- Activity logging middleware and service-level audit records.
- Socket.io gateway with JWT handshake authentication.
- Next.js frontend with login/register flows, dashboard, sidebar, profile page, dark mode, and Socket.io integration.
- Docker Compose for PostgreSQL, Redis, backend API, frontend, and host agent.

## Quick start

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Docker startup:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

## API endpoints

- `GET /api/health` verifies API and database connectivity.
- `POST /api/auth/register` creates a local account.
- `POST /api/auth/login` returns JWT access and refresh tokens.
- `POST /api/auth/refresh` rotates a refresh token and returns a new token pair.
- `POST /api/auth/logout` revokes a refresh token.
- `GET /api/auth/discord` starts Discord OAuth2.
- `GET /api/auth/discord/callback?code=...` completes Discord OAuth2.
- `GET /api/auth/me` returns the authenticated principal.
- `GET /api/users` lists users for administrators.
- `GET /api/users/:id` gets a user for administrators.
- `PATCH /api/users/:id/role` updates a user role for administrators.
- `POST /api/users/:id/disable` disables a user for administrators.
- `POST /api/users/:id/enable` enables a user for administrators.
