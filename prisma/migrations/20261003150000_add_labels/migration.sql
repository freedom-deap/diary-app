CREATE TABLE "Label" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpotLabel" (
    "spotId" UUID NOT NULL,
    "labelId" UUID NOT NULL,
    CONSTRAINT "SpotLabel_pkey" PRIMARY KEY ("spotId", "labelId")
);

CREATE UNIQUE INDEX "Label_name_key" ON "Label"("name");
CREATE INDEX "Label_createdAt_idx" ON "Label"("createdAt");
CREATE INDEX "SpotLabel_labelId_idx" ON "SpotLabel"("labelId");
ALTER TABLE "SpotLabel" ADD CONSTRAINT "SpotLabel_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpotLabel" ADD CONSTRAINT "SpotLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
