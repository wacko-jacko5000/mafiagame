# Crime Module

## Purpose

Own the primary solo action loop for risk, reward, and backend-owned execution rules.

## Responsibilities

- Define crime catalogs and success formulas.
- Persist editable starter crime balance values while keeping ids, names, and consequence metadata in the module catalog.
- Resolve success or failure for starter crimes.
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

## Test expectations

- Formula correctness
- Success and failure execution flow
- Energy validation and player-state mutation routing
