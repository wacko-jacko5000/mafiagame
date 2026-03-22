# Missions API

- `GET /api/missions`
- response includes progression metadata such as `unlockLevel`, `requiredLevel`, `objectiveType`, `target`, and explicit rewards
- `GET /api/me/missions`
- `POST /api/me/missions/:missionId/accept`
- `POST /api/me/missions/:missionId/complete`
- `GET /api/players/:playerId/missions`
- `POST /api/players/:playerId/missions/:missionId/accept`
- `POST /api/players/:playerId/missions/:missionId/complete`

## Note

- `/api/me/*` mission routes reduce actor spoofing for player-owned actions.
- Player-id mission routes remain transitional until broader ownership hardening is complete.
- Mission definition responses expose enough progression metadata for future frontend lock-state rendering without requiring frontend-owned formulas.
- Accepted mission reads continue to expose progress and completion state through player-owned mission rows.
