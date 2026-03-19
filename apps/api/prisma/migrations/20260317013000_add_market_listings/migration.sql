ALTER TABLE "player_inventory_items"
ADD COLUMN "marketListingId" UUID;

CREATE TYPE "MarketListingStatus" AS ENUM ('active', 'sold', 'cancelled');

CREATE TABLE "market_listings" (
  "id" UUID NOT NULL,
  "inventoryItemId" UUID NOT NULL,
  "sellerPlayerId" UUID NOT NULL,
  "price" INTEGER NOT NULL,
  "status" "MarketListingStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "soldAt" TIMESTAMP(3),
  "buyerPlayerId" UUID,

  CONSTRAINT "market_listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "market_listings_inventoryItemId_key" ON "market_listings"("inventoryItemId");
CREATE UNIQUE INDEX "player_inventory_items_marketListingId_key" ON "player_inventory_items"("marketListingId");
CREATE INDEX "market_listings_sellerPlayerId_status_idx" ON "market_listings"("sellerPlayerId", "status");
CREATE INDEX "market_listings_status_createdAt_idx" ON "market_listings"("status", "createdAt");
CREATE INDEX "market_listings_buyerPlayerId_idx" ON "market_listings"("buyerPlayerId");

ALTER TABLE "market_listings"
ADD CONSTRAINT "market_listings_inventoryItemId_fkey"
FOREIGN KEY ("inventoryItemId") REFERENCES "player_inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "market_listings"
ADD CONSTRAINT "market_listings_sellerPlayerId_fkey"
FOREIGN KEY ("sellerPlayerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "market_listings"
ADD CONSTRAINT "market_listings_buyerPlayerId_fkey"
FOREIGN KEY ("buyerPlayerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
