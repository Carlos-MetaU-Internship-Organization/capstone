/*
  Warnings:

  - You are about to drop the `SearchPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SearchPreference" DROP CONSTRAINT "SearchPreference_favoriterId_fkey";

-- DropForeignKey
ALTER TABLE "SearchPreference" DROP CONSTRAINT "SearchPreference_viewerId_fkey";

-- DropTable
DROP TABLE "SearchPreference";

-- CreateTable
CREATE TABLE "SearchFilter" (
    "id" SERIAL NOT NULL,
    "saverId" INTEGER,
    "viewerId" INTEGER,
    "condition" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "distance" INTEGER NOT NULL,
    "zip" TEXT NOT NULL,
    "color" TEXT,
    "minYear" INTEGER,
    "maxYear" INTEGER,
    "maxMileage" INTEGER,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchFilter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SearchFilter" ADD CONSTRAINT "SearchFilter_saverId_fkey" FOREIGN KEY ("saverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchFilter" ADD CONSTRAINT "SearchFilter_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
