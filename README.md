# Qamqor AI

Full-stack volunteer social capital platform (Next.js 14, PostgreSQL, Prisma).

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (PostgreSQL).
2. Install and migrate:

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Volunteer | aida@qamqor.kz | password123 |
| Organization | org@greenfuture.kz | password123 |
| Admin | admin@qamqor.kz | password123 |

## Render deployment

1. Create a **PostgreSQL** database on Render.
2. Create a **Web Service** from this repo.
3. Set `DATABASE_URL` from the database connection string (use **Internal** URL for the web service).
4. Build command: `npm install && npx prisma migrate deploy && npm run build`
5. Start command: `npm start`
6. After first deploy, run **Shell**: `npx prisma db seed`

Or use the included `render.yaml` Blueprint.

## Architecture

- **UI**: `app/(public)` landing · `app/(platform)` dashboards
- **API**: `app/api/**` REST routes
- **Services**: `lib/services/**` business logic
- **DB**: `prisma/schema.prisma` · `lib/prisma.ts`
- **Auth**: HTTP-only session cookie + `Session` table
