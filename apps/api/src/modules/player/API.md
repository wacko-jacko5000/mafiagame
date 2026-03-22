# Player API

- `POST /api/players`
  - request: `{ "displayName": string }`
  - optional auth: `Authorization: Bearer <token>`
  - response: full player foundation record including derived rank progression fields
- `GET /api/players/:id`
  - response: full player foundation record including:
    - `level`
    - `rank`
    - `currentRespect`
    - `currentLevelMinRespect`
    - `nextLevel`
    - `nextRank`
    - `nextLevelRespectRequired`
    - `respectToNextLevel`
    - `progressPercent`
- `GET /api/players/:id/resources`
  - response: `{ cash, respect, energy, health }`

## Notes

- Player reads now include nullable `jailedUntil` and `hospitalizedUntil` timestamps for internal and client visibility.
- Player reads lazily regenerate energy before returning the aggregate or resource projection.
- Player reads derive level and rank from current total respect; the API does not persist a separate level field.
- Max-level players return `null` for next-level fields and `100` for `progressPercent`.
- Dedicated current-status reads still belong to the `jail` and `hospital` modules.
- When `POST /api/players` is authenticated, the created player is bound to the current account.
- Unauthenticated player creation is still temporarily available for transition compatibility.

## Validation

- `displayName` is required.
- `displayName` is trimmed and normalized before persistence.
- `displayName` must be unique.
- `id` must be a UUID.
