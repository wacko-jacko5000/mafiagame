# Architecture

## Top-level structure

- `apps/web`: presentation and client-side interaction only.
- `apps/api`: API, domain orchestration, realtime gateways, and background job entry points.
- `packages/types`: stable contracts shared across apps.
- `packages/config`: balance catalogs and static configuration.
- `docs`: product and engineering guidance.

## Layering model

Each backend domain module should evolve toward these layers:

- `domain`: entities, value objects, policies, formulas, domain events.
- `application`: use cases, orchestration, command handlers, transactional workflows.
- `infrastructure`: persistence, external adapters, queues, sockets.
- `api`: DTOs, controllers, contracts, transport mapping.
- `tests`: unit, integration, and exploit/regression coverage.

## Boundaries

- UI never computes authoritative rewards, penalties, or cooldowns.
- Modules communicate through stable application APIs and documented events.
- Shared packages expose contracts, not feature orchestration.
- Realtime delivery mirrors committed backend state; it does not invent state.
- `auth` owns account identity, credential validation, and request authentication.
- `player` remains the owner of player state and now stores a nullable one-to-one `accountId` ownership link.
- Authenticated actor-sensitive gameplay migration should prefer explicit `/api/me/*` routes instead of trusting arbitrary `playerId` input.

## Current internal domain event layer

- The API now includes a small synchronous in-process domain event layer under `apps/api/src/platform/domain-events`.
- Gameplay application services publish explicit typed events only after their primary action succeeds.
- Consumers such as `missions`, `achievements`, and `notifications` subscribe in-process and translate only the events they care about into module-owned behavior.
- This is a temporary decoupling layer, not a broker, worker system, plugin framework, or delivery-guarantee mechanism.

## Planned runtime shape

- Next.js web frontend
- NestJS backend API
- PostgreSQL + Prisma persistence
- Realtime gateway for chat, gang activity, and event fan-out
- Worker processes for timers, payouts, cooldown expiry, and scheduled events

## Runtime foundation implemented in phase 2

- `apps/web/app`: Next.js App Router entry point and minimal runtime shell.
- `apps/web/src/lib`: client-safe helpers for runtime configuration only.
- `apps/api/src/platform/config`: environment validation and startup config.
- `apps/api/src/platform/database`: Prisma client wiring and database connectivity checks.
- `apps/api/src/platform/health`: non-gameplay health endpoint for uptime verification.
- `apps/api/prisma`: Prisma schema and generated client source of truth.

## Deliberate non-goals in phase 2

- No gameplay modules were wired into Nest runtime yet.
- No crime, combat, or economy tables were added yet.
- No business logic is moved into React or startup glue code.

## First gameplay slice in phase 3

- `player` is the first live gameplay module.
- The player slice owns its own Prisma model, service, controller, and tests.
- `crime` is the second live gameplay module and depends only on explicit player-service contracts.
- `jail` and `hospital` now own consequence rules and status APIs while routing persistence through player-owned state.
- `inventory` now owns starter item catalogs, item ownership, purchase orchestration, and basic equipped-slot state while player still owns cash persistence.
- `market` now owns player item listing persistence and simple trade settlement while using explicit inventory-row locking and player cash updates inside a single backend transaction.
- `combat` now owns PvP attack resolution while reading equipment through inventory and applying hospital consequences through explicit cross-module rules.
- `gangs` now owns gang creation, membership persistence, invite state, and basic leader-only permissions while player remains the owner of player identity.
- `territory` now owns district persistence, current district control, simple district payout rules, and minimal district war records while validating gang references and leader claim authority through gangs-owned application APIs and routing temporary cash credits through the player application API.
- `leaderboard` now owns static public ranking definitions and read-side leaderboard queries backed directly by existing persisted player and achievement state.
- `seasons` now owns persistent season records, current-season reads, and the single-active-season lifecycle rule for future seasonal integrations.
- Other gameplay modules remain scaffolds until implemented.
