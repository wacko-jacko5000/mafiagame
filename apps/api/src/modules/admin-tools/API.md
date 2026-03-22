# Admin Tools API

## Balance endpoints

- `GET /api/admin/balance`
  - header: `Authorization: Bearer <token>`
- response: `{ sections: [...] }`
- `GET /api/admin/balance/:section`
  - header: `Authorization: Bearer <token>`
  - supported sections: `crimes`, `districts`, `shop-items`
- `GET /api/admin/balance/audit`
  - header: `Authorization: Bearer <token>`
  - optional query params: `section`, `targetId`, `limit`
  - response: `{ entries: [...] }`
- `PATCH /api/admin/balance/:section`
  - header: `Authorization: Bearer <token>`
  - updates only the explicit editable fields for that section

## Section payloads

- `PATCH /api/admin/balance/crimes`
  - request: `{ "crimes": [{ "id": "pickpocket", "energyCost": 12, "successRate": 0.7, "cashRewardMin": 150, "cashRewardMax": 240, "respectReward": 2 }] }`
- `PATCH /api/admin/balance/districts`
  - request: `{ "districts": [{ "id": "<district-uuid>", "payoutAmount": 1250, "payoutCooldownMinutes": 90 }] }`
- `PATCH /api/admin/balance/shop-items`
  - request: `{ "items": [{ "id": "rusty-knife", "price": 450 }] }`

## Sticky menu endpoints

- `GET /api/sticky-menu`
  - public read used by the gameplay shell
- `GET /api/admin/sticky-menu`
  - header: `Authorization: Bearer <token>`
- `PATCH /api/admin/sticky-menu`
  - header: `Authorization: Bearer <token>`
  - request:
    `{
      "header": { "enabled": true, "resourceKeys": ["cash", "respect"] },
      "primaryItems": ["home", "crimes", "missions", "shop", "more"],
      "moreItems": ["business", "inventory", "activity", "achievements", "gangs", "territory", "market", "leaderboard"]
    }`
  - validation rules:
    - primary items are capped at 5
    - only known destination keys are allowed
    - `more` may appear only in primary items
    - `moreItems` requires `more` to be present in primary items
    - the same destination cannot appear in both primary and More groups

## Temporary note

- These endpoints now require a valid authenticated session for an account with `isAdmin: true`.
- `ADMIN_EMAILS` may be configured as a comma-separated bootstrap list for initial admin accounts.
- Audit rows write `changedByAccountId` from the authenticated admin account.
- Sticky menu reads are public because they expose only safe destination keys, not privileged state.
