ALTER TABLE "player_inventory_items"
ADD COLUMN "equippedSlot" VARCHAR(16);

CREATE UNIQUE INDEX "player_inventory_items_playerId_equippedSlot_key"
ON "player_inventory_items"("playerId", "equippedSlot");
