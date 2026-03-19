# Frontend Integration Phase

## Scope implemented

This phase adds a narrow but usable web client slice against the existing backend without redesigning backend-owned rules or contracts.

Working routes in `apps/web`:

- `/login`
- `/register`
- `/create-player`
- `/`
- `/crimes`
- `/inventory`
- `/missions`
- `/activity`
- `/leaderboard`

## Architectural decisions

- Auth stays explicit and replaceable: the web app stores the bearer access token client-side and re-validates it through `GET /api/auth/me`.
- Player bootstrap stays explicit: if an authenticated account has no bound player, the web app sends `POST /api/players` with the bearer token and waits for the backend to own account-to-player binding.
- API calls are centralized under `apps/web/src/lib/game-api.ts` and `apps/web/src/lib/api-client.ts`.
- Screen state is local to the route that owns it. No heavy state library was added.

## Implemented screens

### Complete in this phase

- Auth register/login
- Session restore on reload
- Player creation bootstrap
- Dashboard with player basics and recent activity
- Crime list and execute flow
- Inventory shop, owned inventory, equip, and unequip flow
- Mission list, accept, and complete flow
- Activity feed list and mark-read flow
- Public leaderboard read

### Explicitly left for later

- Market, combat, gangs, territory, admin, and season-focused UI
- Realtime feed updates
- Rich optimistic caching and invalidation strategy
- Cookie/refresh-token auth redesign
- Full visual design system and mobile refinement

## Backend changes

None were required for this frontend integration pass. The existing auth, player, crimes, inventory, missions, notifications, and leaderboard endpoints were sufficient.
