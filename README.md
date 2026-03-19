# Mafia Game Platform

Modern browser-based mafia strategy game platform with a web-first product surface, backend-owned game rules, and a structure that can later support mobile clients and admin tooling without moving core logic.

## Foundation goals

- Preserve the old-school web mafia loop while using modern service boundaries.
- Keep domain rules explicit, centralized, and documented.
- Make the repository understandable to future engineers and LLMs with minimal guesswork.
- Treat the backend API and shared domain packages as the source of truth for business behavior.

## Workspace layout

- `apps/web`: Next.js web client shell and presentation layer.
- `apps/api`: NestJS-oriented backend shell and domain module ownership boundaries.
- `packages/types`: Shared domain contracts, module metadata, and event naming.
- `packages/config`: Shared balance catalogs and runtime-independent configuration.
- `docs`: Product, architecture, editing, and change workflow documentation.

## Current phase

This repository is bootstrapped as a product-platform foundation. The current phase establishes:

- the monorepo structure,
- the global documentation set,
- shared module and balance contracts,
- domain module scaffolds with explicit ownership docs,
- a real Next.js runtime in `apps/web`,
- a real NestJS + Prisma runtime in `apps/api`,
- a local PostgreSQL bootstrap path through Docker Compose,
- the first live gameplay slice for player foundation,
- the first consequence slice for jail and hospital crime lockouts,
- the first starter shop and inventory progression slice,
- the first basic equipment slice for owned-item slot assignment,
- the first combat action slice for player-vs-player attacks,
- the gangs foundation for social grouping and membership,
- the territory foundation for district ownership by gangs,
- the gangs invite and permission basics for controlled social growth,
- the territory claim authorization layer for leader-only district claims,
- the first territory payout layer with leader-claimed cooldown-based district cash payouts,
- the first black market layer with fixed-price player item listings and purchases,
- the gang war placeholder flow for contested district takeovers,
- the first missions/contracts layer with accept-progress-complete starter goals,
- the first achievements layer with static catalog entries and event-driven player unlock state,
- the first leaderboard layer with static public player rankings backed by existing persisted state,
- the first seasons/live-ops structure with persistent season records, current-season reads, and admin-controlled activation flows,
- the first player activity feed layer with persistent feed entries generated from explicit domain events,
- the first narrow admin balancing layer with explicit read/update endpoints for crime values, district payouts, and starter shop prices, plus persistent crime/shop balance storage and minimal balance audit logging,
- the first minimal auth/account layer with persistent account identity, bearer-session auth, one-account-to-one-player ownership, and explicit authenticated `/me/*` gameplay routes for a narrow actor-sensitive slice.
- the first usable frontend integration pass with explicit auth/session handling, player bootstrap, and a small set of web gameplay screens wired against those backend routes.

Framework bootstrapping and playable features should build on these contracts rather than bypass them.
