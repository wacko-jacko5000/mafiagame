# Missions Module

## Purpose

Own directed goals, static starter contracts, player mission state, and mission completion rewards.

## Responsibilities

- Define the centralized static mission catalog and unlock metadata.
- Track accepted mission progress and completion state per player.
- Validate mission completion against explicit progress counters.
- Grant cash and respect rewards through the player module boundary.

## Entities and value objects

- `MissionDefinition`
- `PlayerMission`
- `MissionCompletionResult`

## Dependencies

- `player`
- `inventory`
- `gangs`
- `territory`
- internal in-process domain events

## Progress inputs

- explicit in-process domain events from `crime`, `inventory`, `combat`, and `territory`
- direct module-owned state reads for current inventory, equipment, gang membership, and district control checks
- no external broker or async event bus in this phase

## API surface

- `GET /missions`
- `GET /players/:playerId/missions`
- `POST /players/:playerId/missions/:missionId/accept`
- `POST /players/:playerId/missions/:missionId/complete`

## Current progression shape

- The missions module now owns a static catalog with 3 missions per level across levels 1-21.
- Every mission definition includes explicit `unlockLevel`, `objectiveType`, `target`, `rewardCash`, and `rewardRespect`.
- Mission accept flows validate the player's derived level from respect before creating or reactivating mission state.
- Accepted missions mix event-driven progress (`crime_count`, `win_combat`) with explicit state evaluation (`earn_money`, `reach_respect`, equipment, gang, and territory objectives).

## Test expectations

- accept/re-accept rules for repeatable vs one-off missions
- progress updates from supported gameplay events
- Reward correctness
- duplicate completion protection
