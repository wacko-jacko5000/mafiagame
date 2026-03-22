# Admin Tools Module

## Purpose

Own operator workflows for moderation, balance management, and live-service control.

## Responsibilities

- Gate privileged operations behind explicit policies.
- Orchestrate narrow balance reads and updates without bypassing domain ownership.
- Record minimal audit entries for successful balance updates.
- Own the safe admin-configured sticky mobile navigation settings consumed by the web shell.
- Support future expansion to audit logging, moderation, and richer live-ops tooling.

## Entities and value objects

- `AdminAction`
- `BalanceChangeRequest`
- `ModerationDecision`

## Dependencies

- `crime`
- `inventory`
- `territory`
- `auth` for persisted admin identity and route protection
- `player` indirectly, through sticky-header resource field expectations owned by the frontend shell

## Events

- Out: none in this phase
- In: none in this phase

## API surface

- `GET /api/admin/balance`
- `GET /api/admin/balance/audit`
- `GET /api/admin/balance/:section`
- `PATCH /api/admin/balance/:section`
- `GET /api/sticky-menu`
- `GET /api/admin/sticky-menu`
- `PATCH /api/admin/sticky-menu`

## Test expectations

- Admin-role gate enforcement
- Validation correctness for each editable section
- Sticky menu validation for allowed destination keys, unique placement, `More` coupling, and primary-count limits
- Unsafe direct mutation prevention through module-owned services

## Current phase note

- This phase is intentionally narrow.
- Crime balance values and starter item prices now persist as explicit module-owned balance records and hydrate the module catalogs on startup.
- District payout values remain on the `territory` persistence model because that ownership already exists.
- Admin balance updates now write a minimal audit row with section, target, previous value, new value, changed timestamp, and nullable `changedByAccountId`.
- Admin routes now require an authenticated account with `isAdmin: true`.
- `ADMIN_EMAILS` can bootstrap initial admin accounts by email; matching accounts are promoted on registration or authenticated lookup.
- Sticky menu config now persists in a single controlled settings row and only accepts known destination/resource keys.
- This module still does not implement bulk tooling, arbitrary CMS-style links, change reasons, rollback tooling, diff visualizations, or seasonal overrides.
