# Frontend Integration Phase

## Scope implemented

This phase adds a narrow but usable web client slice against the existing backend without redesigning backend-owned rules or contracts.

Working routes in `apps/web`:

- `/login`
- `/register`
- `/create-player`
- `/`
- `/gangs`
- `/territory`
- `/market`
- `/achievements`
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
- Dashboard with player basics, season visibility, gang summary, territory summary, mission summary, achievements summary, and recent activity
- Gangs page with gang creation, membership visibility, incoming invite decisions, leave flow, and leader invite-status visibility
- Territory page with district controllers, payout timers, active wars, and existing claim/payout/start-war actions
- Market page with active listings, buy flow, create listing flow, and cancel flow
- Achievements page with progress and unlocked-state visibility
- Crime list and execute flow
- Inventory shop, owned inventory, equip, and unequip flow
- Mission list, accept, and complete flow
- Activity feed list and mark-read flow
- Public leaderboard read plus gang-leader invite actions

### Explicitly left for later

- Combat, admin, and richer season-focused UI
- Realtime feed updates
- Rich optimistic caching and invalidation strategy
- Cookie/refresh-token auth redesign
- Full visual design system and mobile refinement

## Backend changes

One minimal backend visibility helper was added: `GET /players/:playerId/gang-membership`.

This was required so the frontend can determine the logged-in player's current gang and unlock the new gang and territory screens without guessing or moving backend-owned rules into the client.
