-- DropIndex (old unique constraints)
DROP INDEX IF EXISTS "Reel_url_key";
DROP INDEX IF EXISTS "Category_name_key";
DROP INDEX IF EXISTS "Tag_name_key";

-- Add userId columns as nullable first
ALTER TABLE "Reel" ADD COLUMN "userId" TEXT;
ALTER TABLE "Category" ADD COLUMN "userId" TEXT;
ALTER TABLE "Tag" ADD COLUMN "userId" TEXT;

-- Set placeholder userId for existing data
UPDATE "Reel" SET "userId" = 'legacy-user' WHERE "userId" IS NULL;
UPDATE "Category" SET "userId" = 'legacy-user' WHERE "userId" IS NULL;
UPDATE "Tag" SET "userId" = 'legacy-user' WHERE "userId" IS NULL;

-- Make userId NOT NULL
ALTER TABLE "Reel" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Category" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Tag" ALTER COLUMN "userId" SET NOT NULL;

-- Add compound unique constraints
CREATE UNIQUE INDEX "Reel_url_userId_key" ON "Reel"("url", "userId");
CREATE UNIQUE INDEX "Category_name_userId_key" ON "Category"("name", "userId");
CREATE UNIQUE INDEX "Tag_name_userId_key" ON "Tag"("name", "userId");

-- Add indexes
CREATE INDEX "Reel_userId_idx" ON "Reel"("userId");
CREATE INDEX "Category_userId_idx" ON "Category"("userId");
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");
