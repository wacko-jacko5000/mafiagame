-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "displayName" VARCHAR(24) NOT NULL,
    "cash" INTEGER NOT NULL,
    "respect" INTEGER NOT NULL,
    "energy" INTEGER NOT NULL,
    "health" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_displayName_key" ON "players"("displayName");
