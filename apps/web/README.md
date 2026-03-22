# Web App

Web-first client boundary for the browser experience. The target runtime is Next.js, but this phase focuses on preserving presentation-only responsibilities and stable shared contracts.

The current frontend slice now includes:

- explicit bearer-session auth against `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`
- a player bootstrap screen for authenticated accounts without a bound player
- authenticated gameplay screens for dashboard, crimes, inventory/equipment, missions, activity feed, gangs, territory, market, and achievements
- a dedicated authenticated shop screen for level-gated weapon and armor purchases
- a safe placeholder business route so navigation config can target a valid future destination
- a leaderboard screen that also doubles as a practical gang invite surface for leaders
- a small frontend API client and session layer under `src/lib` and `src/components/providers`
- a mobile-first gameplay shell with a sticky top header, sticky bottom nav, and a `More` sheet driven by backend-owned sticky menu config
- an admin sticky menu editor that only works with safe destination keys and frontend-owned route/icon mappings

Still intentionally out of scope:

- websocket or realtime UI
- broad coverage for every backend module beyond the current tester pass
- a full design system or heavy client-side state framework
