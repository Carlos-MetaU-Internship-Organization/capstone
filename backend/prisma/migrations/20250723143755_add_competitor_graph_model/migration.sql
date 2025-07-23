-- CreateTable
CREATE TABLE "CompetitorGraph" (
    "id" SERIAL NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "competitorMake" TEXT NOT NULL,
    "competitorModel" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "CompetitorGraph_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorGraph_make_model_competitorMake_competitorModel_key" ON "CompetitorGraph"("make", "model", "competitorMake", "competitorModel");
