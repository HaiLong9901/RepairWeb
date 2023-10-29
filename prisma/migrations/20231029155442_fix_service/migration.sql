-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "incurredCost" BIGINT,
ADD COLUMN     "incurredCostReason" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "image" TEXT;
