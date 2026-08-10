/*
  Warnings:

  - You are about to drop the column `fee` on the `PaymentTransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "fee",
ADD COLUMN     "networkFee" DECIMAL(20,8),
ADD COLUMN     "platformFee" DECIMAL(20,8),
ALTER COLUMN "confirmations" DROP NOT NULL,
ALTER COLUMN "originalAmount" DROP NOT NULL;
