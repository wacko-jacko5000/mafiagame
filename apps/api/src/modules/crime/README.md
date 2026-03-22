# Crime Module

## Purpose

Own the primary solo action loop for risk, reward, and backend-owned execution rules.

## Responsibilities

- Define the centralized static crime catalog, unlock metadata, and success formulas.
- Persist editable starter crime balance values while keeping ids, names, and consequence metadata in the module catalog.
- Resolve success or failure for level-gated crimes.
- Apply crime-side effects through explicit player-module contracts.
- Execute against lazily regenerated player energy so stuck-at-zero accounts recover through normal play.
- Trigger jail or hospital consequences through their owning modules when a failed crime says so.

## Entities and value objects

- `CrimeDefinition`
- `CrimeOutcome`
- `CrimeCatalog`

## Dependencies

- `player`
- `jail`
- `hospital`

## Events

- Out: `crime.completed`
- In: none in this phase

## API surface

- `GET /api/crimes`
- `POST /api/players/:id/crimes/:crimeId/execute`
- Internal catalog and execution services
- Internal persisted balance hydration for editable crime values

## Current progression shape

- The crime module now owns a static catalog with 4 crimes per level across levels 1-21.
- Each crime definition includes explicit `unlockLevel`, `difficulty`, `minReward`, `maxReward`, and `respectReward`.
- Crime execution validates the player's derived level from respect before attempting the action.
- Crime list responses expose unlock metadata so future frontend work can distinguish locked and unlocked entries without moving rules into the client.

## Test expectations

- Formula correctness
- Success and failure execution flow
- Energy validation and player-state mutation routing
