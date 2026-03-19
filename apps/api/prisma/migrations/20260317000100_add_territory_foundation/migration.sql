CREATE TABLE "districts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "district_controls" (
    "id" UUID NOT NULL,
    "districtId" UUID NOT NULL,
    "gangId" UUID NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "district_controls_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "districts_name_key" ON "districts"("name");
CREATE UNIQUE INDEX "district_controls_districtId_key" ON "district_controls"("districtId");
CREATE INDEX "district_controls_gangId_idx" ON "district_controls"("gangId");

ALTER TABLE "district_controls"
ADD CONSTRAINT "district_controls_districtId_fkey"
FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "district_controls"
ADD CONSTRAINT "district_controls_gangId_fkey"
FOREIGN KEY ("gangId") REFERENCES "gangs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "districts" ("id", "name") VALUES
('5f3bb5c7-c26d-43f9-b2b0-7f4ab6e0f001', 'Downtown'),
('5f3bb5c7-c26d-43f9-b2b0-7f4ab6e0f002', 'Little Italy'),
('5f3bb5c7-c26d-43f9-b2b0-7f4ab6e0f003', 'The Docks'),
('5f3bb5c7-c26d-43f9-b2b0-7f4ab6e0f004', 'Industrial Block'),
('5f3bb5c7-c26d-43f9-b2b0-7f4ab6e0f005', 'Uptown');
