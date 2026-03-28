ALTER TABLE "shop_item_balances"
ADD COLUMN "name" VARCHAR(120),
ADD COLUMN "type" VARCHAR(16),
ADD COLUMN "category" VARCHAR(32),
ADD COLUMN "delivery" VARCHAR(16),
ADD COLUMN "equipSlot" VARCHAR(16),
ADD COLUMN "unlockLevel" INTEGER,
ADD COLUMN "damageBonus" INTEGER,
ADD COLUMN "damageReduction" INTEGER,
ADD COLUMN "resourceEffectResource" VARCHAR(16),
ADD COLUMN "resourceEffectAmount" INTEGER;
