/*
  Warnings:

  - A unique constraint covering the columns `[orderId,variantId,size]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `size` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "order_items_orderId_variantId_key";

-- AlterTable
ALTER TABLE "PurchaseItem" ADD COLUMN     "size" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "size" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "order_items_orderId_variantId_size_key" ON "order_items"("orderId", "variantId", "size");
