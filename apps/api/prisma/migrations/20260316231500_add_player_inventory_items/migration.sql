CREATE TABLE "player_inventory_items" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "itemId" VARCHAR(64) NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_inventory_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "player_inventory_items_playerId_idx" ON "player_inventory_items"("playerId");

ALTER TABLE "player_inventory_items"
ADD CONSTRAINT "player_inventory_items_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
