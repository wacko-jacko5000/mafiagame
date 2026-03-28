ALTER TABLE "shop_item_balances"
ADD COLUMN "respectBonus" INTEGER,
ADD COLUMN "parkingSlots" INTEGER,
ADD COLUMN "archived" BOOLEAN DEFAULT false;
