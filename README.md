# Allo Health — Inventory Reservation System

A full-stack inventory reservation platform built with NestJS (backend) and Next.js (frontend).

## Tech Stack

- **Backend:** NestJS, Prisma, PostgreSQL (Supabase), Redis (Upstash)
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Zod
- **Monorepo:** pnpm workspaces

## Project Structure

- `apps/backend` — NestJS REST API
- `apps/frontend` — Next.js frontend
- `packages/shared` — Shared Zod schemas and TypeScript types

## How to run locally

### Prerequisites

- Node.js v20+
- pnpm installed globally

### Steps

1. Clone the repo

```bash
   git clone https://github.com/YOUR_USERNAME/allo-health.git
   cd allo-health
```

2. Install dependencies

```bash
   cd apps/backend && pnpm install
   cd ../frontend && pnpm install
```

3. Set up environment variables

   - Create `apps/backend/.env` (see Environment Variables section)
   - Create `apps/frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001`
4. Run database migrations

```bash
   cd apps/backend
   pnpm exec prisma migrate dev
```

5. Seed the database

```bash
   pnpm exec prisma db seed
```

6. Start the backend

```bash
   pnpm run start:dev
```

7. Start the frontend (in a new terminal)

```bash
   cd apps/frontend
   pnpm run dev
```

8. Open http://localhost:3000

## Environment Variables

Created a '.env' file inside 'apps/backend' with the following:

```
env
DATABASE_URL=           # Supabase pooled connection string
DIRECT_URL=             # Supabase direct connection string (used for migrations)
REDIS_URL=              # Upstash Redis connection string
PORT=3001
```

## API Endpoints

### Products

**-**`GET /products` — list all products with stock levels

### Warehouse

**-**`GET /warehouses` — list all warehouses with stock

### Reservations

**-**`POST /reservations` — create a reservation
**-**`PATCH /reservations/:id/confirm` — confirm a reservation
**-**`PATCH /reservations/:id/release` — release a reservation
