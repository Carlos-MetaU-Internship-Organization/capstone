/*
  Warnings:

  - You are about to drop the column `minrice` on the `SearchPreference` table. All the data in the column will be lost.
  - Added the required column `minPrice` to the `SearchPreference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SearchPreference" DROP COLUMN "minrice",
ADD COLUMN     "minPrice" TEXT NOT NULL;
