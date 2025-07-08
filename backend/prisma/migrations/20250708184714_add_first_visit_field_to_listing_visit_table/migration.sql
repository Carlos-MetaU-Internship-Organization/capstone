/*
  Warnings:

  - You are about to drop the column `visitedAt` on the `ListingVisit` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ListingVisit_userId_visitedAt_idx";

-- AlterTable
ALTER TABLE "ListingVisit" DROP COLUMN "visitedAt",
ADD COLUMN     "clickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstVisitAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recentVisitAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
