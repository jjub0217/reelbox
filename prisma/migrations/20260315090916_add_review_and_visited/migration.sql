-- AlterTable
ALTER TABLE "Reel" ADD COLUMN     "review" TEXT,
ADD COLUMN     "visited" BOOLEAN NOT NULL DEFAULT false;
