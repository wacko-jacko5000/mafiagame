# Combat Module

## Purpose

Own conflict resolution for PvP and future PvE encounters.

## Responsibilities

- Resolve attacks, defense, damage, and basic defeat outcomes.
- Read equipped weapon and armor projections through inventory-owned contracts.
- Apply target health reduction and hospital consequences.

## Entities and value objects

- `CombatEncounter`
- `CombatLoadout`
- `CombatOutcome`

## Dependencies

- `player`, `inventory`, `jail`, `hospital`

## Temporary note

- This phase supports only direct player-vs-player attacks.
- Combat uses simple deterministic formulas with starter equipment bonuses.
- Armor damage reduction is read from the target's currently equipped inventory armor item at attack time.
- Combat history, loot, rankings, gangs, and advanced PvP systems are intentionally left out for later.

## Events

- Out: `combat.started`, `combat.won`
- In: `inventory.item.used`

## API surface

- Attack initiation endpoint
- Internal combat resolution services

## Test expectations

- Damage formulas
- Action gating
- Hospital consequence routing
