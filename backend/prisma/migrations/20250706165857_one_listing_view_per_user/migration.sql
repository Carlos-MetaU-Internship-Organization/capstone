/*
  Warnings:

  - A unique constraint covering the columns `[userId,listingId]` on the table `ListingVisit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ListingVisit_userId_listingId_key" ON "ListingVisit"("userId", "listingId");
