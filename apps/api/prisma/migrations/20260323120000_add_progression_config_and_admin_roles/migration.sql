-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'balance_admin');

-- CreateEnum
CREATE TYPE "ProgressionConfigStatus" AS ENUM ('draft', 'published', 'scheduled', 'archived');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN "adminRole" "AdminRole";

-- CreateTable
CREATE TABLE "progression_configs" (
    "id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "ProgressionConfigStatus" NOT NULL,
    "payload" JSONB NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdByAccountId" UUID,
    "updatedByAccountId" UUID,
    "publishedByAccountId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progression_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "progression_configs_version_key" ON "progression_configs"("version");

-- CreateIndex
CREATE INDEX "progression_configs_publishedAt_idx" ON "progression_configs"("publishedAt");

-- CreateIndex
CREATE INDEX "progression_configs_scheduledFor_idx" ON "progression_configs"("scheduledFor");

-- CreateIndex
CREATE INDEX "progression_configs_status_createdAt_idx" ON "progression_configs"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "progression_configs" ADD CONSTRAINT "progression_configs_createdByAccountId_fkey" FOREIGN KEY ("createdByAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_configs" ADD CONSTRAINT "progression_configs_updatedByAccountId_fkey" FOREIGN KEY ("updatedByAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progression_configs" ADD CONSTRAINT "progression_configs_publishedByAccountId_fkey" FOREIGN KEY ("publishedByAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
