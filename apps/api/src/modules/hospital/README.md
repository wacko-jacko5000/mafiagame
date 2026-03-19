# Hospital Module

## Purpose

Own injury state, incapacitation restrictions, healing, and recovery timers.

## Responsibilities

- Track hospitalization state.
- Enforce action limits while recovering.
- Expose simple hospitalized status reads and timed recovery behavior.

## Entities and value objects

- `HospitalStay`
- `RecoveryTimer`
- `HealingOption`

## Dependencies

- `player`

## Temporary note

- This phase uses a nullable `Player.hospitalizedUntil` timestamp instead of a dedicated hospital-stay table.
- Combat can now trigger basic hospitalization by reusing this timer state.
- Healing items, paid healing, and status history are intentionally left out for later.

## Events

- Out: `hospital.entered`, `hospital.released`
- In: `combat.resolved`

## API surface

- Hospital status reads
- Heal/discharge commands
- Internal injury application services

## Test expectations

- Recovery math
- Heal-cost correctness
- Double-release prevention
