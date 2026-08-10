/*
  Warnings:

  - You are about to drop the `Candle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Candle" DROP CONSTRAINT "Candle_assetId_fkey";

-- DropTable
DROP TABLE "Candle";
