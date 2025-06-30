/*
  Warnings:

  - You are about to drop the column `makeId` on the `Model` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Make` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `makeName` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_makeId_fkey";

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "makeId",
ADD COLUMN     "makeName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Make_name_key" ON "Make"("name");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_makeName_fkey" FOREIGN KEY ("makeName") REFERENCES "Make"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
