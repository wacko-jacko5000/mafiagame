# Auth API

- `POST /api/auth/register`
  - request: `{ "email": string, "password": string }`
  - response: `{ accessToken, account }`
- `POST /api/auth/login`
  - request: `{ "email": string, "password": string }`
  - response: `{ accessToken, account }`
- `GET /api/auth/me`
  - auth: `Authorization: Bearer <token>`
  - response: `{ account }`

## Notes

- Accounts are persistent and separate from player state.
- `account.isAdmin` exposes the persisted admin role used by protected operator routes.
- `account.player` is nullable until an authenticated account explicitly creates a player.
- Session tokens are opaque bearer tokens stored server-side as hashes for revocation and expiry support.
- `ADMIN_EMAILS` can bootstrap initial admin accounts by email.
- Logout, refresh rotation, and password recovery remain out of scope for this phase.
