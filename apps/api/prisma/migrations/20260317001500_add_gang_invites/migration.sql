CREATE TYPE "GangInviteStatus" AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE "gang_invites" (
    "id" UUID NOT NULL,
    "gangId" UUID NOT NULL,
    "invitedPlayerId" UUID NOT NULL,
    "invitedByPlayerId" UUID NOT NULL,
    "status" "GangInviteStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gang_invites_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gang_invites_gangId_idx" ON "gang_invites"("gangId");
CREATE INDEX "gang_invites_invitedPlayerId_idx" ON "gang_invites"("invitedPlayerId");
CREATE INDEX "gang_invites_status_idx" ON "gang_invites"("status");

ALTER TABLE "gang_invites"
ADD CONSTRAINT "gang_invites_gangId_fkey"
FOREIGN KEY ("gangId") REFERENCES "gangs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "gang_invites"
ADD CONSTRAINT "gang_invites_invitedPlayerId_fkey"
FOREIGN KEY ("invitedPlayerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "gang_invites"
ADD CONSTRAINT "gang_invites_invitedByPlayerId_fkey"
FOREIGN KEY ("invitedByPlayerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
