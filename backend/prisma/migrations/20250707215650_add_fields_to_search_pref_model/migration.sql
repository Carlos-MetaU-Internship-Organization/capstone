/*
  Warnings:

  - You are about to drop the column `userId` on the `SearchPreference` table. All the data in the column will be lost.
  - Added the required column `favoriterId` to the `SearchPreference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viewerId` to the `SearchPreference` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SearchPreference" DROP CONSTRAINT "SearchPreference_userId_fkey";

-- AlterTable
ALTER TABLE "SearchPreference" DROP COLUMN "userId",
ADD COLUMN     "favoriterId" INTEGER NOT NULL,
ADD COLUMN     "viewerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SearchPreference" ADD CONSTRAINT "SearchPreference_favoriterId_fkey" FOREIGN KEY ("favoriterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchPreference" ADD CONSTRAINT "SearchPreference_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
