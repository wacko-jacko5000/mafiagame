# Leaderboard API

- `GET /api/leaderboards`
  - response: static leaderboard definitions available to clients
- `GET /api/leaderboards/:leaderboardId`
  - query: optional `limit` positive integer, capped per board
  - response: `{ id, name, description, metricKey, limit, entries[] }`

## Available leaderboard ids

- `richest_players`
- `most_respected_players`
- `most_achievements_unlocked`
