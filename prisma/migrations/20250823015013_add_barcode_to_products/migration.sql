/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BarcodeType" AS ENUM ('CODE128', 'CODE39', 'CODE93', 'EAN13', 'EAN8', 'UPC_A', 'UPC_E', 'QR_CODE', 'DATA_MATRIX', 'PDF417', 'AZTEC', 'CODABAR', 'ITF');

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "barcodeType" "BarcodeType" DEFAULT 'CODE128';

-- CreateIndex
CREATE UNIQUE INDEX "Products_barcode_key" ON "Products"("barcode");

-- CreateIndex
CREATE INDEX "Products_barcode_idx" ON "Products"("barcode");
