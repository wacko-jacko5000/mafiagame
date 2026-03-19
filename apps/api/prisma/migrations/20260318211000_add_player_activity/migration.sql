-- CreateTable
CREATE TABLE "player_activities" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" VARCHAR(280) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "player_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "player_activities_playerId_createdAt_idx" ON "player_activities"("playerId", "createdAt");

-- AddForeignKey
ALTER TABLE "player_activities" ADD CONSTRAINT "player_activities_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
