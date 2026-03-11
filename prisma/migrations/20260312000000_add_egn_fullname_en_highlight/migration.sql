-- AlterTable
ALTER TABLE "people" ADD COLUMN "egn" TEXT;
ALTER TABLE "people" ADD COLUMN "full_name_en" TEXT;
ALTER TABLE "people" ADD COLUMN "highlight_color" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "people_egn_key" ON "people"("egn");
