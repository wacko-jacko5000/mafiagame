CREATE TABLE "player_achievements" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "achievementId" VARCHAR(64) NOT NULL,
    "progress" INTEGER NOT NULL,
    "targetProgress" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3),

    CONSTRAINT "player_achievements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "player_achievements_playerId_achievementId_key" ON "player_achievements"("playerId", "achievementId");
CREATE INDEX "player_achievements_playerId_idx" ON "player_achievements"("playerId");

ALTER TABLE "player_achievements"
ADD CONSTRAINT "player_achievements_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
