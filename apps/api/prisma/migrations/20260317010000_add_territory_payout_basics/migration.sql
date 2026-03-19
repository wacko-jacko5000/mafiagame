ALTER TABLE "districts"
ADD COLUMN "payoutAmount" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN "payoutCooldownMinutes" INTEGER NOT NULL DEFAULT 60;

ALTER TABLE "district_controls"
ADD COLUMN "lastPayoutClaimedAt" TIMESTAMP(3);
