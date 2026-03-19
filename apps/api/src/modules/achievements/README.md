# Achievements Module

## Purpose

Own static achievement definitions and per-player achievement progress/unlock state.

## Responsibilities

- Define the centralized starter achievement catalog.
- Track cumulative progress and unlock timestamps per player.
- Consume explicit in-process domain events from gameplay modules.
- Unlock achievements automatically when progress reaches the target count.

## Dependencies

- `player`
- internal in-process domain events

## Progress inputs

- `crime.completed`
- `inventory.item_purchased`
- `combat.won`
- `territory.district_claimed`
- `market.item_sold`

## Internal outputs

- Publishes `achievements.unlocked` when a player crosses an unlock threshold for the first time.

## API surface

- `GET /achievements`
- `GET /players/:playerId/achievements`

## Temporary note

- Achievement definitions are static and centralized in this phase.
- Achievements do not grant rewards, claim actions, badge art, hidden states, or seasonal variants yet.
- Event handling stays synchronous and in-process like `missions`.

## Test expectations

- catalog listing
- player achievement state listing with explicit progress
- event-driven progress updates
- single unlock behavior without duplicate unlocks
