# Player API

- `POST /api/players`
  - request: `{ "displayName": string }`
  - optional auth: `Authorization: Bearer <token>`
  - response: full player foundation record
- `GET /api/players/:id`
  - response: full player foundation record
- `GET /api/players/:id/resources`
  - response: `{ cash, respect, energy, health }`

## Notes

- Player reads now include nullable `jailedUntil` and `hospitalizedUntil` timestamps for internal and client visibility.
- Player reads lazily regenerate energy before returning the aggregate or resource projection.
- Dedicated current-status reads still belong to the `jail` and `hospital` modules.
- When `POST /api/players` is authenticated, the created player is bound to the current account.
- Unauthenticated player creation is still temporarily available for transition compatibility.

## Validation

- `displayName` is required.
- `displayName` is trimmed and normalized before persistence.
- `displayName` must be unique.
- `id` must be a UUID.
