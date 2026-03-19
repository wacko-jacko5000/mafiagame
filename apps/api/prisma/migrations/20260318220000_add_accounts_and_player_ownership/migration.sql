-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_sessions" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "account_sessions_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "players" ADD COLUMN "accountId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_sessions_tokenHash_key" ON "account_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "account_sessions_accountId_idx" ON "account_sessions"("accountId");

-- CreateIndex
CREATE INDEX "account_sessions_expiresAt_idx" ON "account_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "players_accountId_key" ON "players"("accountId");

-- CreateIndex
CREATE INDEX "players_accountId_idx" ON "players"("accountId");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_sessions" ADD CONSTRAINT "account_sessions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
