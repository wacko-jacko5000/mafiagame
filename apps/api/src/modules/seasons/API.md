# Seasons API

- `GET /api/seasons`
  Returns all persisted seasons in reverse creation order for history and admin-facing read use.

- `GET /api/seasons/current`
  Returns `{ "season": ... }` for the currently active season or `{ "season": null }` when no season is active.

- `GET /api/seasons/:seasonId`
  Returns a single persisted season by UUID.

- `POST /api/admin/seasons`
  Creates a draft season.

  Example body:
  ```json
  {
    "name": "Spring Season",
    "startsAt": "2026-04-01T00:00:00.000Z",
    "endsAt": "2026-04-30T00:00:00.000Z"
  }
  ```

- `POST /api/admin/seasons/:seasonId/activate`
  Activates the target season and automatically deactivates any previously active season.

- `POST /api/admin/seasons/:seasonId/deactivate`
  Deactivates the target season. This only succeeds when the target season is currently active.
