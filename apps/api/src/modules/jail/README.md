# Jail Module

## Purpose

Own arrest state, restrictions, jail timers, and release flows.

## Responsibilities

- Track jailed state and release timing.
- Enforce action restrictions while jailed.
- Expose simple jailed status reads and timed release behavior.

## Entities and value objects

- `JailSentence`
- `ReleaseMethod`
- `CustodyState`

## Dependencies

- `player`

## Temporary note

- This phase uses a nullable `Player.jailedUntil` timestamp instead of a dedicated jail table.
- Bail, jailbreak, gang rescue, and status history are intentionally left out for later.

## Events

- Out: `jail.entered`, `jail.released`
- In: `crime.resolved`, `combat.resolved`

## API surface

- Jail status reads
- Release/bribe commands
- Internal sentence application services

## Test expectations

- Restriction enforcement
- Timer expiry
- Bribe abuse prevention
