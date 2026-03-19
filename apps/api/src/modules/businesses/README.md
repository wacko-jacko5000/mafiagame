# Businesses Module

## Purpose

Own passive income assets, upgrades, and recurring business payouts.

## Responsibilities

- Define business catalogs and upgrade paths.
- Calculate payout schedules and operating costs.
- Coordinate worker-driven passive income generation.

## Entities and value objects

- `Business`
- `BusinessUpgrade`
- `PayoutSchedule`

## Dependencies

- `player`, `economy`

## Events

- Out: `businesses.payout.completed`
- In: `economy.transfer.completed`

## API surface

- Business portfolio reads
- Purchase/upgrade commands
- Worker payout handlers

## Test expectations

- Payout formulas
- Upgrade effects
- Worker idempotency
