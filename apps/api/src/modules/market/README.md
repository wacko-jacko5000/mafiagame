# Market Module

## Purpose

Own player-to-player item listings and simple item-trade settlement.

## Responsibilities

- Create, read, buy, and cancel player item listings.
- Coordinate item ownership transfer with inventory-owned rows.
- Coordinate direct buyer-to-seller cash settlement while player still owns cash state.

## Entities and value objects

- `MarketListing`
- `ListingPrice`
- `TradeSettlement`

## Dependencies

- `inventory`, `player`

## Events

- Out: `market.listing.created`, `market.item_sold`, `market.listing.cancelled`
- In: none in this phase

## API surface

- Listing create/read endpoints
- Listing buy/cancel commands
- Market listing read models

## Test expectations

- Settlement correctness
- Ownership and equipped-item constraints
- Double-buy prevention

## Temporary note

- Listings currently support only fixed-price direct sales between players.
- Listed items are locked by a market-owned listing reference on the inventory row.
- Gang markets, auctions, escrow, fees, taxes, and pricing history are intentionally deferred.
