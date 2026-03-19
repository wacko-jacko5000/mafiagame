# Runtime Setup

## Purpose

Describe the boring, explicit local runtime needed to boot the platform without implementing gameplay.

## Components

- `apps/web`: Next.js application shell on port `3000`
- `apps/api`: NestJS API shell on port `3001`
- `postgres`: PostgreSQL 16 container from `docker-compose.yml`
- `Prisma`: backend-only database client and connectivity layer

## Environment files

- Copy `apps/web/.env.example` to `apps/web/.env.local` when overriding the API origin.
- Copy `apps/api/.env.example` to `apps/api/.env` for local API configuration.
- For phone testing on your local network, set `NEXT_PUBLIC_API_ORIGIN` to your computer's LAN URL, for example `http://192.168.1.10:3001`, or rely on the browser-host fallback when opening the web app by LAN IP.

## Local start sequence

1. `pnpm install`
2. `pnpm db:up`
3. `pnpm --filter @mafia-game/api start`
4. `pnpm --filter @mafia-game/web dev`

## Verification points

- API health: `GET http://localhost:3001/api/health`
- Web shell: `GET http://localhost:3000`
- Database probe: the API health payload reports `database.status = "up"` when PostgreSQL is reachable
- Web prototype flow:
  - register or login at `http://localhost:3000/login`
  - if the account has no player yet, create one at `http://localhost:3000/create-player`
  - continue into `/`, `/crimes`, `/inventory`, `/missions`, `/activity`, and `/leaderboard`

## Design constraints

- Keep platform runtime code under `apps/api/src/platform`.
- Keep gameplay module directories as scaffolds until their features are implemented.
- The current exceptions are `player` and `crime`, which are the first live gameplay-owned modules.
- Do not add Prisma models for gameplay entities until the owning module is being built.
