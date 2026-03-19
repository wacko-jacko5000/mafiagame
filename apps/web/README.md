# Web App

Web-first client boundary for the browser experience. The target runtime is Next.js, but this phase focuses on preserving presentation-only responsibilities and stable shared contracts.

The current frontend slice now includes:

- explicit bearer-session auth against `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`
- a player bootstrap screen for authenticated accounts without a bound player
- authenticated gameplay screens for dashboard, crimes, inventory/equipment, missions, and activity feed
- a read-only leaderboard screen
- a small frontend API client and session layer under `src/lib` and `src/components/providers`

Still intentionally out of scope:

- websocket or realtime UI
- broad coverage for every backend module
- mobile-specific surfaces
- a full design system or heavy client-side state framework
