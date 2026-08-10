/*
  Warnings:

  - You are about to drop the column `closePrice` on the `Candle` table. All the data in the column will be lost.
  - You are about to drop the column `highPrice` on the `Candle` table. All the data in the column will be lost.
  - You are about to drop the column `lowPrice` on the `Candle` table. All the data in the column will be lost.
  - You are about to drop the column `openPrice` on the `Candle` table. All the data in the column will be lost.
  - Added the required column `close` to the `Candle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `high` to the `Candle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `low` to the `Candle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `open` to the `Candle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candle" DROP COLUMN "closePrice",
DROP COLUMN "highPrice",
DROP COLUMN "lowPrice",
DROP COLUMN "openPrice",
ADD COLUMN     "close" DECIMAL(20,8) NOT NULL,
ADD COLUMN     "high" DECIMAL(20,8) NOT NULL,
ADD COLUMN     "low" DECIMAL(20,8) NOT NULL,
ADD COLUMN     "open" DECIMAL(20,8) NOT NULL;
