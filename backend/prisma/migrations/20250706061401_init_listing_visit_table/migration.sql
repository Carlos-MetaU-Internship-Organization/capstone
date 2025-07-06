-- CreateTable
CREATE TABLE "ListingVisit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dwellTime" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ListingVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingVisit_userId_visitedAt_idx" ON "ListingVisit"("userId", "visitedAt");

-- AddForeignKey
ALTER TABLE "ListingVisit" ADD CONSTRAINT "ListingVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingVisit" ADD CONSTRAINT "ListingVisit_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
