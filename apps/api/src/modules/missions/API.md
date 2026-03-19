# Missions API

- `GET /api/missions`
- `GET /api/me/missions`
- `POST /api/me/missions/:missionId/accept`
- `POST /api/me/missions/:missionId/complete`
- `GET /api/players/:playerId/missions`
- `POST /api/players/:playerId/missions/:missionId/accept`
- `POST /api/players/:playerId/missions/:missionId/complete`

## Note

- `/api/me/*` mission routes reduce actor spoofing for player-owned actions.
- Player-id mission routes remain transitional until broader ownership hardening is complete.
