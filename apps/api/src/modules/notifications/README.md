# Notifications Module

## Purpose

Own persistent player activity feed records and the feed-read API contract.

## Responsibilities

- Persist player activity entries.
- Translate a narrow set of explicit domain events into player-facing feed items.
- Expose player activity feed reads and explicit mark-read behavior.

## Entities and value objects

- `PlayerActivity`

## Dependencies

- `player`
- `gangs`
- internal in-process domain events

## Events

- Out: none in this phase
- In: `market.item_sold`, `territory.payout_claimed`, `territory.war_won`, `achievements.unlocked`, `gangs.invite_received`

## API surface

- `GET /players/:playerId/activity`
- `POST /players/:playerId/activity/:activityId/read`

## Temporary note

- Phase 1 is an in-app activity feed only.
- Push notifications, email/SMS delivery, preferences, realtime fan-out, templating, admin messaging, and digesting remain intentionally deferred.
- Feed entries stay explicit and hand-mapped to avoid noisy low-value activity items.

## Test expectations

- event-to-activity mapping
- player feed reads
- explicit mark-read behavior
- gang-wide fan-out for territory war wins
