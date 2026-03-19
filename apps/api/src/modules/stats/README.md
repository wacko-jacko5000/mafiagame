# Stats Module

## Purpose

Own derived and mutable gameplay stats such as health, stamina, heat, and XP.

## Responsibilities

- Centralize stat mutation rules.
- Publish derived values consumed by action systems.
- Coordinate recovery-facing values with hospital and jail systems.

## Entities and value objects

- `PlayerStats`
- `StatDelta`
- `RecoveryState`

## Dependencies

- `player`

## Events

- Out: `stats.changed`
- In: `player.created`

## API surface

- Internal stat mutation services
- Read models for player-facing stat summaries

## Test expectations

- Formula correctness
- Clamp and floor behavior
- Recovery edge cases
