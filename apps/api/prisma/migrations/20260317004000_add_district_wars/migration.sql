CREATE TYPE "DistrictWarStatus" AS ENUM ('pending', 'resolved');

CREATE TABLE "district_wars" (
    "id" UUID NOT NULL,
    "districtId" UUID NOT NULL,
    "attackerGangId" UUID NOT NULL,
    "defenderGangId" UUID NOT NULL,
    "startedByPlayerId" UUID NOT NULL,
    "status" "DistrictWarStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "winningGangId" UUID,

    CONSTRAINT "district_wars_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "district_wars_districtId_status_idx" ON "district_wars"("districtId", "status");
CREATE INDEX "district_wars_attackerGangId_idx" ON "district_wars"("attackerGangId");
CREATE INDEX "district_wars_defenderGangId_idx" ON "district_wars"("defenderGangId");
CREATE INDEX "district_wars_winningGangId_idx" ON "district_wars"("winningGangId");

ALTER TABLE "district_wars"
ADD CONSTRAINT "district_wars_districtId_fkey"
FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "district_wars"
ADD CONSTRAINT "district_wars_attackerGangId_fkey"
FOREIGN KEY ("attackerGangId") REFERENCES "gangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "district_wars"
ADD CONSTRAINT "district_wars_defenderGangId_fkey"
FOREIGN KEY ("defenderGangId") REFERENCES "gangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "district_wars"
ADD CONSTRAINT "district_wars_startedByPlayerId_fkey"
FOREIGN KEY ("startedByPlayerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "district_wars"
ADD CONSTRAINT "district_wars_winningGangId_fkey"
FOREIGN KEY ("winningGangId") REFERENCES "gangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
