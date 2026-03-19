# Admin Tools API

## Balance endpoints

- `GET /api/admin/balance`
  - header: `x-admin-token`
  - response: `{ sections: [...] }`
- `GET /api/admin/balance/:section`
  - header: `x-admin-token`
  - supported sections: `crimes`, `districts`, `shop-items`
- `GET /api/admin/balance/audit`
  - header: `x-admin-token`
  - optional query params: `section`, `targetId`, `limit`
  - response: `{ entries: [...] }`
- `PATCH /api/admin/balance/:section`
  - header: `x-admin-token`
  - optional auth: `Authorization: Bearer <token>`
  - updates only the explicit editable fields for that section

## Section payloads

- `PATCH /api/admin/balance/crimes`
  - request: `{ "crimes": [{ "id": "pickpocket", "energyCost": 12, "successRate": 0.7, "cashRewardMin": 150, "cashRewardMax": 240, "respectReward": 2 }] }`
- `PATCH /api/admin/balance/districts`
  - request: `{ "districts": [{ "id": "<district-uuid>", "payoutAmount": 1250, "payoutCooldownMinutes": 90 }] }`
- `PATCH /api/admin/balance/shop-items`
  - request: `{ "items": [{ "id": "rusty-knife", "price": 450 }] }`

## Temporary note

- These endpoints use a temporary shared secret header because full RBAC is not implemented yet.
- `ADMIN_API_KEY` must be configured or the endpoints stay disabled.
- Audit rows write `changedByAccountId` only when a valid bearer-authenticated account is also present. Shared-secret-only requests still write audit rows with `changedByAccountId: null`.
