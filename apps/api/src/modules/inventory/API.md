# Inventory API

- `GET /api/shop/items`
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

- Player inventory reads now include `marketListingId` so clients can see whether an item is currently locked by an active market listing.
- Admin balance reads and updates for starter shop prices now flow through `admin-tools`, but the catalog still belongs to `inventory`.
- Editable starter shop prices now persist as explicit shop-item balance rows and hydrate the inventory catalog on startup.
- Authenticated `/api/me/*` inventory routes are the preferred client path; player-id routes remain transitional.
