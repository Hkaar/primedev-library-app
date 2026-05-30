-- AlterTable
ALTER TABLE "Borrowings" ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Categories" ADD COLUMN     "depth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentCategoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "Categories" ADD CONSTRAINT "Categories_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
