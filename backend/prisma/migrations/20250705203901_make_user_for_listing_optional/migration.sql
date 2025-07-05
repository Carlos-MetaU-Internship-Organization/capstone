-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_ownerId_fkey";

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "ownerId" DROP NOT NULL,
ALTER COLUMN "ownerId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
