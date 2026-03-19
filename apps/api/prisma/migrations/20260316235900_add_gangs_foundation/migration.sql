CREATE TYPE "GangRole" AS ENUM ('leader', 'member');

CREATE TABLE "gangs" (
    "id" UUID NOT NULL,
    "name" VARCHAR(24) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByPlayerId" UUID NOT NULL,

    CONSTRAINT "gangs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gang_members" (
    "id" UUID NOT NULL,
    "gangId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "role" "GangRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gang_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gangs_name_key" ON "gangs"("name");
CREATE INDEX "gangs_createdByPlayerId_idx" ON "gangs"("createdByPlayerId");
CREATE UNIQUE INDEX "gang_members_playerId_key" ON "gang_members"("playerId");
CREATE INDEX "gang_members_gangId_idx" ON "gang_members"("gangId");

ALTER TABLE "gangs"
ADD CONSTRAINT "gangs_createdByPlayerId_fkey"
FOREIGN KEY ("createdByPlayerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "gang_members"
ADD CONSTRAINT "gang_members_gangId_fkey"
FOREIGN KEY ("gangId") REFERENCES "gangs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "gang_members"
ADD CONSTRAINT "gang_members_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
