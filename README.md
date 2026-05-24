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
