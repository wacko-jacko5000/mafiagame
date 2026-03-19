CREATE TYPE "SeasonStatus" AS ENUM ('draft', 'active', 'inactive');

CREATE TABLE "seasons" (
    "id" UUID NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "status" "SeasonStatus" NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "seasons_status_createdAt_idx" ON "seasons"("status", "createdAt");

CREATE UNIQUE INDEX "seasons_single_active_idx" ON "seasons"("status") WHERE "status" = 'active';
