# Territory Module

## Purpose

Own district persistence, current district control state, basic district payout rules, and minimal district war records.

## Responsibilities

- Define district records and current control state.
- Define district payout configuration and payout cooldown state.
- Resolve direct district ownership changes for unclaimed districts.
- Own minimal district war records for contested districts.
- Expose district and controller reads for future world/map consumers.

## Entities and value objects

- `District`
- `DistrictControl`
- `DistrictWar`
- `DistrictPayout`

## Dependencies

- `gangs`

## Events

- Out: `territory.district_claimed`, `territory.payout_claimed`, `territory.war_won`
- In: none in this phase

## API surface

- District list reads
- District detail reads
- District claim command with explicit player actor
- District payout claim command with explicit player actor
- District war start and resolve commands

## Test expectations

- District-control correctness
- District payout cooldown correctness
- Claim ownership changes
- Leader-only claim authorization
- Leader-only payout authorization
- One-active-war-per-district enforcement
- Manual war resolution changing control
- Unclaimed and re-claimed district reads

## Temporary note

- District payouts are currently claimed manually by the controlling gang's leader and paid directly into that acting player's cash as the smallest correct step.
- Territory owns the payout rules and timestamps; `player` still owns cash persistence.
- Territory also emits feed-friendly payout and war-win event payloads for the player activity feed without taking ownership of notification persistence.
- Gang-bank routing, passive accrual, and scheduled payout jobs are intentionally deferred.
