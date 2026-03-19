# Notifications API

- `GET /api/me/activity`
- `POST /api/me/activity/:activityId/read`
- `GET /api/players/:playerId/activity`
- `POST /api/players/:playerId/activity/:activityId/read`
- Internal event contracts consumed: `market.item_sold`, `territory.payout_claimed`, `territory.war_won`, `achievements.unlocked`, `gangs.invite_received`

## Note

- `/api/me/*` activity routes are the preferred authenticated path.
- Player-id activity routes remain transitional during the ownership-hardening phase.
