# Market API

- `GET /api/market/listings`
- `GET /api/market/listings/:listingId`
- `POST /api/market/listings`
  - request: `{ "playerId": string, "inventoryItemId": string, "price": number }`
  - response: market listing
- `POST /api/market/listings/:listingId/buy`
  - request: `{ "buyerPlayerId": string }`
  - response: `{ listing, transferredInventoryItemId, sellerPlayerId, buyerPlayerId, buyerCashAfterPurchase, sellerCashAfterSale }`
- `POST /api/market/listings/:listingId/cancel`
  - request: `{ "playerId": string }`
  - response: market listing
