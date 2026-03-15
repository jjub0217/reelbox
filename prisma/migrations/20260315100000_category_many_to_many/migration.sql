-- CreateTable
CREATE TABLE "ReelCategory" (
    "reelId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ReelCategory_pkey" PRIMARY KEY ("reelId","categoryId")
);

-- Migrate existing data
INSERT INTO "ReelCategory" ("reelId", "categoryId")
SELECT "id", "categoryId" FROM "Reel" WHERE "categoryId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Reel" DROP CONSTRAINT IF EXISTS "Reel_categoryId_fkey";

-- DropColumn
ALTER TABLE "Reel" DROP COLUMN "categoryId";

-- AddForeignKey
ALTER TABLE "ReelCategory" ADD CONSTRAINT "ReelCategory_reelId_fkey" FOREIGN KEY ("reelId") REFERENCES "Reel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReelCategory" ADD CONSTRAINT "ReelCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
