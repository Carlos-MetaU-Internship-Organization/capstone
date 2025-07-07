-- CreateTable
CREATE TABLE "SearchPreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "distance" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "minYear" TEXT NOT NULL,
    "maxYear" TEXT NOT NULL,
    "maxMileage" TEXT NOT NULL,
    "minrice" TEXT NOT NULL,
    "maxPrice" TEXT NOT NULL,

    CONSTRAINT "SearchPreference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SearchPreference" ADD CONSTRAINT "SearchPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
