/*
  Warnings:

  - A unique constraint covering the columns `[vin]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Listing_vin_key" ON "Listing"("vin");
