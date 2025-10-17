-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "specialDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "specialDiscountType" TEXT NOT NULL DEFAULT 'none';
