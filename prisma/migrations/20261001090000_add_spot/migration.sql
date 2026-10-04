CREATE TABLE "Spot" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" VARCHAR(300),
    "description" TEXT,
    "impression" TEXT,
    "visitedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Spot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Spot_createdAt_idx" ON "Spot"("createdAt");
CREATE INDEX "Spot_visitedAt_idx" ON "Spot"("visitedAt");
