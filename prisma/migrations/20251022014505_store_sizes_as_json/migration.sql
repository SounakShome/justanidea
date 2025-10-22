/*
  Warnings:

  - You are about to drop the column `price` on the `Variants` table. All the data in the column will be lost.
  - You are about to drop the column `sellingPrice` on the `Variants` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Variants` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Variants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId,name]` on the table `Variants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Variants_productId_size_name_key";

-- AlterTable
ALTER TABLE "Variants" DROP COLUMN "price",
DROP COLUMN "sellingPrice",
DROP COLUMN "size",
DROP COLUMN "stock",
ADD COLUMN     "sizes" JSONB NOT NULL DEFAULT '[]';

-- CreateIndex
CREATE UNIQUE INDEX "Variants_productId_name_key" ON "Variants"("productId", "name");
