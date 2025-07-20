/*
  Warnings:

  - The `minYear` column on the `SearchPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxYear` column on the `SearchPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxMileage` column on the `SearchPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `maxPrice` column on the `SearchPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `minPrice` column on the `SearchPreference` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `distance` on the `SearchPreference` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SearchPreference" DROP COLUMN "distance",
ADD COLUMN     "distance" INTEGER NOT NULL,
DROP COLUMN "minYear",
ADD COLUMN     "minYear" INTEGER,
DROP COLUMN "maxYear",
ADD COLUMN     "maxYear" INTEGER,
DROP COLUMN "maxMileage",
ADD COLUMN     "maxMileage" INTEGER,
DROP COLUMN "maxPrice",
ADD COLUMN     "maxPrice" INTEGER,
DROP COLUMN "minPrice",
ADD COLUMN     "minPrice" INTEGER;
