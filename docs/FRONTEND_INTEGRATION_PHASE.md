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
- `/shop`
- `/business`
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
- The gameplay shell now shares a small player snapshot provider so mobile sticky header resources can stay current without moving rules into React.
- Sticky menu structure is backend-configured but frontend-owned in presentation: the API returns safe destination keys, and the web app maps them to routes, labels, and icons.
- Screen state is still local to the route that owns it. No heavy state library was added.

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
- Dedicated shop page with level-gated catalog visibility and purchase flow
- Business placeholder route so sticky navigation can safely point at a valid future-economy destination
- Inventory page with owned inventory, equipment visibility, and equip/unequip flow
- Mission list, accept, and complete flow
- Activity feed list and mark-read flow
- Public leaderboard read plus gang-leader invite actions
- Mobile sticky top header with current page title plus configurable player resource pills
- Mobile sticky bottom nav with up to five primary items plus a `More` bottom sheet
- Admin-managed sticky menu controls for header visibility/resource fields, primary items, More items, ordering, and visibility

### Explicitly left for later

- Combat and richer season-focused UI
- Realtime feed updates
- Rich optimistic caching and invalidation strategy
- Cookie/refresh-token auth redesign
- Full visual design system beyond the current mobile-first navigation shell

## Backend changes

Additional backend UI-contract helpers now exist for the mobile shell:

- `GET /api/sticky-menu`
- `GET /api/admin/sticky-menu`
- `PATCH /api/admin/sticky-menu`

These routes keep sticky navigation configurable without exposing arbitrary route editing to operators.
