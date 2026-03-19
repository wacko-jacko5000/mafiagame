-- CreateTable
CREATE TABLE "crime_balances" (
    "crimeId" VARCHAR(64) NOT NULL,
    "energyCost" INTEGER NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "cashRewardMin" INTEGER NOT NULL,
    "cashRewardMax" INTEGER NOT NULL,
    "respectReward" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crime_balances_pkey" PRIMARY KEY ("crimeId")
);

-- CreateTable
CREATE TABLE "shop_item_balances" (
    "itemId" VARCHAR(64) NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_item_balances_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "balance_change_logs" (
    "id" UUID NOT NULL,
    "section" VARCHAR(32) NOT NULL,
    "targetId" VARCHAR(64) NOT NULL,
    "changedByAccountId" UUID,
    "previousValue" JSONB NOT NULL,
    "newValue" JSONB NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "balance_change_logs_section_changedAt_idx" ON "balance_change_logs"("section", "changedAt");

-- CreateIndex
CREATE INDEX "balance_change_logs_targetId_changedAt_idx" ON "balance_change_logs"("targetId", "changedAt");

-- CreateIndex
CREATE INDEX "balance_change_logs_changedByAccountId_idx" ON "balance_change_logs"("changedByAccountId");

-- AddForeignKey
ALTER TABLE "balance_change_logs" ADD CONSTRAINT "balance_change_logs_changedByAccountId_fkey" FOREIGN KEY ("changedByAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
