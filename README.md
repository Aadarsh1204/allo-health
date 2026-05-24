# Allo Health — Inventory Reservation System

A full-stack inventory reservation platform built with NestJS (backend) and Next.js (frontend).

## Tech Stack

- **Backend:** NestJS, Prisma, PostgreSQL (Supabase), Redis (Upstash)
- **Frontend:** Next.js 16 (App Router), Tailwind CSS, shadcn/ui, Zod
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
   git clone https://github.com/Aadarsh1204/allo-health.git
   cd allo-health
```

2. Install dependencies

```bash
   cd apps/backend && pnpm install
   cd ../frontend && pnpm install
```

3. Set up environment variables

   - Create `apps/backend/.env` (see Environment Variables section)
   - Create `apps/frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
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

**-**`GET /api/products` — list all products with stock levels

### Warehouse

**-**`GET /api/warehouses` — list all warehouses with stock

### Reservations

**-**`POST /api/reservations` — create a reservation
**-**`POST /api/reservations/:id/confirm` — confirm a reservation
**-**`POST /api/reservations/:id/release` — release a reservation

## Reservation Expiry

Reservations that are not confirmed before their `expiresAt` time are automatically released by a background cron job running every minute inside the NestJS server (`@nestjs/schedule`).

### How it works

1. When a reservation is created, `expiresAt` is set to 15 minutes from the current time.
2. Every minute, the cron job queries for all `PENDING` reservations where `expiresAt < now`.
3. For each expired reservation, it atomically sets the status to `RELEASED` and decrements the `reserved` count on the stock record, returning the units to available inventory.

### Trade-offs

- **Pros:** Simple to implement, no external infrastructure needed, guaranteed to run as long as the server is up.
- **Cons:** If the server goes down, expiry won't run until it restarts. For production, a more robust solution would be a dedicated message queue (e.g. BullMQ with Redis) or a Vercel Cron job hitting a release endpoint.

## Idempotency

The `POST /api/reservations` and `POST /api/reservations/:id/confirm` endpoints support idempotency via the `Idempotency-Key` request header.

### How it works

- The client sends a unique `Idempotency-Key` header with each request.
- For reservations, the key is stored on the record in the database with a unique constraint.
- If a request comes in with a key that already exists, the server returns the original response immediately without repeating any side effects (no double stock decrement, no double confirmation).
- For the confirm endpoint, idempotency is handled by checking if the reservation is already confirmed and returning it as-is.

### Why this matters

If a client retries a request due to a network timeout, the server guarantees the operation only happens once. The customer won't end up with two reservations for the same checkout attempt.


## Deployed URLs

- Frontend: https://frontend-production-00d0.up.railway.app
- Backend: https://backend-production-4699.up.railway.app


## Production Considerations

### Expiry mechanism in production

The cron job runs inside the NestJS process. In production on Railway, this works as long as the server stays up. For a more robust solution with more time, I would use BullMQ with Redis to schedule expiry jobs at reservation creation time — each job fires exactly at `expiresAt` rather than polling every minute. This eliminates the up-to-60-second delay between expiry and cleanup.


### Trade-offs made

- **Cron vs job queue:** Chose a simple cron job over BullMQ for speed of implementation. BullMQ would be more precise and resilient.
- **No authentication:** The API has no auth layer. In production every endpoint would require a JWT or session token.
- **No pagination:** The products and reservations endpoints return all records. With large datasets these would need cursor-based pagination.
- **Frontend validation only at form level:** Zod validates on the frontend but the backend DTOs don't use Zod — they use plain TypeScript classes. With more time I'd share the Zod schemas end-to-end including backend validation pipes.
- **No unit or integration tests:** With more time I'd add Jest unit tests for the reservation service (especially the concurrency logic) and Supertest integration tests for the API endpoints.
- **Basic styling:** The UI is functional but minimal. With more time I'd invest in better layouts, animations, and a more polished visual design.
- **Inline error messages:** Errors are shown as plain text banners. With more time I'd replace these with proper toast notifications (e.g. using shadcn/ui's Sonner integration) for a better user experience.
