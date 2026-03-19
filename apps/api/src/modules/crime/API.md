# Crime API

- `GET /api/crimes`
  - response: list of centralized starter crime definitions
- `POST /api/me/crimes/:crimeId/execute`
  - auth: `Authorization: Bearer <token>`
  - response: `{ crimeId, success, energySpent, cashAwarded, respectAwarded, consequence }`
- `POST /api/players/:id/crimes/:crimeId/execute`
  - response: `{ crimeId, success, energySpent, cashAwarded, respectAwarded, consequence }`

## Notes

- Crime attempts are not persisted yet.
- Crime execution mutates player state through the player module.
- Failed crime consequences are applied through `jail` or `hospital` services, not directly in controller code.
- Admin balance reads and updates for editable starter crime values now flow through `admin-tools`, but rule ownership remains in `crime`.
- Editable starter crime balance fields now persist as explicit crime balance rows and hydrate the crime catalog on startup.
- `/api/me/...` is the ownership-hardened route; the `players/:id` route is transitional.
