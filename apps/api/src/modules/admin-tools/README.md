# Admin Tools Module

## Purpose

Own operator workflows for moderation, balance management, and live-service control.

## Responsibilities

- Gate privileged operations behind explicit policies.
- Orchestrate narrow balance reads and updates without bypassing domain ownership.
- Record minimal audit entries for successful balance updates.
- Support future expansion to audit logging, moderation, and richer live-ops tooling.

## Entities and value objects

- `AdminAction`
- `BalanceChangeRequest`
- `ModerationDecision`

## Dependencies

- `crime`
- `inventory`
- `territory`
- future `auth` integration for real admin identity

## Events

- Out: none in this phase
- In: none in this phase

## API surface

- `GET /api/admin/balance`
- `GET /api/admin/balance/audit`
- `GET /api/admin/balance/:section`
- `PATCH /api/admin/balance/:section`

## Test expectations

- Temporary admin-token gate enforcement
- Validation correctness for each editable section
- Unsafe direct mutation prevention through module-owned services

## Current phase note

- This phase is intentionally narrow.
- Crime balance values and starter item prices now persist as explicit module-owned balance records and hydrate the module catalogs on startup.
- District payout values remain on the `territory` persistence model because that ownership already exists.
- Admin balance updates now write a minimal audit row with section, target, previous value, new value, changed timestamp, and nullable `changedByAccountId`.
- Shared-secret-only admin calls remain auditable but are not attributable to a specific account until a stronger admin identity model exists.
- This module still does not implement RBAC, bulk tooling, change reasons, rollback tooling, diff visualizations, seasonal overrides, or a web admin UI.
