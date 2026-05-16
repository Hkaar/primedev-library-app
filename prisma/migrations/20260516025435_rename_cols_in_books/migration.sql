/*
  Warnings:

  - You are about to drop the column `cloudinaryId` on the `Books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Books" DROP COLUMN "cloudinaryId",
ADD COLUMN     "coverUrl" TEXT;
