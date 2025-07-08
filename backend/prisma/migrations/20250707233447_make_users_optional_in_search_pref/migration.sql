-- DropForeignKey
ALTER TABLE "SearchPreference" DROP CONSTRAINT "SearchPreference_favoriterId_fkey";

-- DropForeignKey
ALTER TABLE "SearchPreference" DROP CONSTRAINT "SearchPreference_viewerId_fkey";

-- AlterTable
ALTER TABLE "SearchPreference" ALTER COLUMN "favoriterId" DROP NOT NULL,
ALTER COLUMN "viewerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SearchPreference" ADD CONSTRAINT "SearchPreference_favoriterId_fkey" FOREIGN KEY ("favoriterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchPreference" ADD CONSTRAINT "SearchPreference_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
