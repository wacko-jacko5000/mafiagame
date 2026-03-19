# Seasons Module

## Purpose

Own persistent season records and the explicit single-active-season lifecycle rule.

## Responsibilities

- Create season records for operator-managed live periods.
- Expose season history and the current active season.
- Enforce that at most one season is active at a time.
- Provide a stable attachment point for later seasonal systems without implementing them yet.

## Dependencies

- `admin-tools` for the existing protected admin route guard pattern

## API surface

- `GET /api/seasons`
- `GET /api/seasons/current`
- `GET /api/seasons/:seasonId`
- `POST /api/admin/seasons`
- `POST /api/admin/seasons/:seasonId/activate`
- `POST /api/admin/seasons/:seasonId/deactivate`

## Current phase note

- Activation automatically deactivates any previously active season inside the module-owned persistence workflow.
- This module intentionally does not implement resets, rewards, battle passes, schedulers, event calendars, or season-specific mission and achievement copies.
- Future systems should attach to a `seasonId` or query the current season through this module instead of re-owning season state elsewhere.
