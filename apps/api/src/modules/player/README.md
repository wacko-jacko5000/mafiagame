# Player Module

## Purpose

Own player profile state and the first persistent gameplay-facing player foundation.

## Responsibilities

- Create and load player records.
- Manage display names and baseline player resources.
- Regenerate energy lazily from player-owned timestamps during normal request flow.
- Expose the canonical player aggregate used by future game systems.
- Persist simple jail and hospital release timestamps for other modules.
- Own the one-to-one link from player state to an authenticated account.

## Entities and value objects

- `Player`
- `PlayerResources`
- `PlayerCreationValues`

## Dependencies

- none in this phase

## Temporary note

- `jailedUntil` and `hospitalizedUntil` currently live on `Player` as the smallest correct persistence step.
- Rule ownership still belongs to the `jail` and `hospital` modules.
- `energyUpdatedAt` tracks the last moment the stored energy value was synchronized against the lazy regeneration rule.
- `accountId` is nullable during the ownership-hardening transition.
- Authenticated `POST /api/players` binds the created player to the current account when a bearer token is present.

## Events

- Out: `player.created`, `player.renamed`
- In: none in this phase

## API surface

- `POST /api/players`
- `GET /api/players/:id`
- `GET /api/players/:id/resources`
- Internal player creation and retrieval services

## Test expectations

- Player creation invariants
- Display name validation
- Resource shape and retrieval behavior
