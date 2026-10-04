CREATE TABLE "Photo" (
    "id" UUID NOT NULL,
    "spotId" UUID NOT NULL,
    "storageKey" VARCHAR(100) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Photo_storageKey_key" ON "Photo"("storageKey");
CREATE INDEX "Photo_spotId_sortOrder_idx" ON "Photo"("spotId", "sortOrder");
CREATE INDEX "Photo_createdAt_idx" ON "Photo"("createdAt");
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
