/*
  Warnings:

  - You are about to drop the column `barcode` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `barcodeType` on the `Products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[barcode]` on the table `Variants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Products_barcode_idx";

-- DropIndex
DROP INDEX "Products_barcode_key";

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "barcode",
DROP COLUMN "barcodeType";

-- AlterTable
ALTER TABLE "Variants" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "barcodeType" "BarcodeType" DEFAULT 'CODE128';

-- CreateIndex
CREATE UNIQUE INDEX "Variants_barcode_key" ON "Variants"("barcode");

-- CreateIndex
CREATE INDEX "Variants_barcode_idx" ON "Variants"("barcode");
