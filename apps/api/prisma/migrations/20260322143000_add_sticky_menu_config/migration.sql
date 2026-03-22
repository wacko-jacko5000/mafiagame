CREATE TABLE "sticky_menu_configs" (
    "id" VARCHAR(32) NOT NULL,
    "headerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "headerResourceKeys" JSONB NOT NULL,
    "primaryItems" JSONB NOT NULL,
    "moreItems" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticky_menu_configs_pkey" PRIMARY KEY ("id")
);
