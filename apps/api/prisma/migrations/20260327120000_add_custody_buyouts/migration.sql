-- CreateEnum
CREATE TYPE "CustodyStatusType" AS ENUM ('jail', 'hospital');

-- CreateEnum
CREATE TYPE "CustodyBuyoutRoundingRule" AS ENUM ('ceil');

-- AlterTable
ALTER TABLE "players"
ADD COLUMN     "jailEntryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hospitalEntryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "jailReason" VARCHAR(160),
ADD COLUMN     "hospitalReason" VARCHAR(160);

-- CreateTable
CREATE TABLE "custody_buyout_configs" (
    "statusType" "CustodyStatusType" NOT NULL,
    "escalationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "escalationPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "minimumPrice" INTEGER,
    "roundingRule" "CustodyBuyoutRoundingRule" NOT NULL DEFAULT 'ceil',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custody_buyout_configs_pkey" PRIMARY KEY ("statusType")
);

-- CreateTable
CREATE TABLE "custody_buyout_level_balances" (
    "statusType" "CustodyStatusType" NOT NULL,
    "level" INTEGER NOT NULL,
    "basePricePerMinute" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custody_buyout_level_balances_pkey" PRIMARY KEY ("statusType","level")
);
