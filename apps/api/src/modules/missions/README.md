# Missions Module

## Purpose

Own directed goals, static starter contracts, player mission state, and mission completion rewards.

## Responsibilities

- Define the centralized starter mission catalog.
- Track accepted mission progress and completion state per player.
- Validate mission completion against explicit progress counters.
- Grant cash and respect rewards through the player module boundary.

## Entities and value objects

- `MissionDefinition`
- `PlayerMission`
- `MissionCompletionResult`

## Dependencies

- `player`
- internal in-process domain events

## Progress inputs

- explicit in-process domain events from `crime`, `inventory`, `combat`, and `territory`
- no external broker or async event bus in this phase

## API surface

- `GET /missions`
- `GET /players/:playerId/missions`
- `POST /players/:playerId/missions/:missionId/accept`
- `POST /players/:playerId/missions/:missionId/complete`

## Test expectations

- accept/re-accept rules for repeatable vs one-off missions
- progress updates from supported gameplay events
- Reward correctness
- duplicate completion protection
