# Leaderboard Module

## Purpose

Own public ranking definitions and read-focused leaderboard queries.

## Responsibilities

- Define the static leaderboard catalog for this phase.
- Read existing persisted player state and project leaderboard entries.
- Expose deterministic public ranking read models for clients.

## Dependencies

- persisted `player` state
- persisted `achievements` state for unlocked-achievement counts

## API surface

- `GET /api/leaderboards`
- `GET /api/leaderboards/:leaderboardId`

## Current leaderboards

- `richest_players` by `Player.cash`
- `most_respected_players` by `Player.respect`
- `most_achievements_unlocked` by unlocked `PlayerAchievement` count

## Temporary note

- No seasons, snapshots, rewards, anti-cheat, gang leaderboards, or historical rank tracking exist yet.
- Ranking ties are ordered by metric descending, then `Player.createdAt` ascending, then `Player.id` ascending.
- `strongest_players` is intentionally deferred until there is a clean authoritative persisted strength metric.

## Test expectations

- static definition listing
- leaderboard read correctness from persisted state
- deterministic tie ordering
- limit validation and capping
