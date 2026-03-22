# Inventory API

- `GET /api/shop/items`
- `GET /api/me/shop/items`
- `GET /api/me/inventory`
- `GET /api/me/equipment`
- `POST /api/me/shop/:itemId/purchase`
- `POST /api/me/inventory/:inventoryItemId/equip/:slot`
- `POST /api/me/equipment/:slot/unequip`
- `GET /api/players/:id/inventory`
- `GET /api/players/:id/equipment`
- `POST /api/players/:id/shop/:itemId/purchase`
- `POST /api/players/:id/inventory/:inventoryItemId/equip/:slot`
- `POST /api/players/:id/equipment/:slot/unequip`

## Note

- `GET /api/me/shop/items` is the preferred frontend shop route because it includes player-relative unlock state for the current catalog.
- Shop item responses now include category, unlock metadata, and structured item stats; authenticated shop reads also include locked/unlocked state.
- Player inventory reads now include `marketListingId` plus catalog metadata and item stats so clients can render owned weapon and armor details without local formulas.
- Admin balance reads and updates for starter shop prices now flow through `admin-tools`, but the catalog still belongs to `inventory`.
- Editable starter shop prices now persist as explicit shop-item balance rows and hydrate the inventory catalog on startup.
- Authenticated `/api/me/*` inventory routes are the preferred client path; player-id routes remain transitional.
