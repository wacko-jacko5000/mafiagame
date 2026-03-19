CREATE TYPE "PlayerMissionStatus" AS ENUM ('active', 'completed');

CREATE TABLE "player_missions" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "missionId" VARCHAR(64) NOT NULL,
    "status" "PlayerMissionStatus" NOT NULL,
    "progress" INTEGER NOT NULL,
    "targetProgress" INTEGER NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "player_missions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "player_missions_playerId_missionId_key" ON "player_missions"("playerId", "missionId");
CREATE INDEX "player_missions_playerId_status_idx" ON "player_missions"("playerId", "status");

ALTER TABLE "player_missions"
ADD CONSTRAINT "player_missions_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
