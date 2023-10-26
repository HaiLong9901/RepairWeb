/*
  Warnings:

  - Added the required column `serviceId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_repairmanId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "total" DROP NOT NULL,
ALTER COLUMN "repairmanId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "serviceId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("serviceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_repairmanId_fkey" FOREIGN KEY ("repairmanId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
