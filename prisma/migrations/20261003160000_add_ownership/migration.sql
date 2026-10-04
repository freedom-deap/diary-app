ALTER TABLE "Spot" ADD COLUMN "ownerId" VARCHAR(100) NOT NULL DEFAULT 'owner';
ALTER TABLE "Label" ADD COLUMN "ownerId" VARCHAR(100) NOT NULL DEFAULT 'owner';
DROP INDEX "Label_name_key";
CREATE INDEX "Spot_ownerId_idx" ON "Spot"("ownerId");
CREATE INDEX "Label_ownerId_idx" ON "Label"("ownerId");
CREATE UNIQUE INDEX "Label_ownerId_name_key" ON "Label"("ownerId", "name");
ALTER TABLE "Spot" ALTER COLUMN "ownerId" DROP DEFAULT;
ALTER TABLE "Label" ALTER COLUMN "ownerId" DROP DEFAULT;
