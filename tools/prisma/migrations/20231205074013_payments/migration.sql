/*
  Warnings:

  - You are about to drop the column `amountUsd` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `fees` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `txid` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the `DepositAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LastDeposit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[foreignId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fee` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalAmount` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foreignId` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `confirmations` on table `PaymentTransaction` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `status` on the `PaymentTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `PaymentTransaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'NOT_CONFIRMED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "DepositAddress" DROP CONSTRAINT "DepositAddress_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "LastDeposit" DROP CONSTRAINT "LastDeposit_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_ownerId_fkey";

-- DropIndex
DROP INDEX "PaymentTransaction_foreignId_paymentSystem_key";

-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "amountUsd",
DROP COLUMN "data",
DROP COLUMN "fees",
DROP COLUMN "ownerId",
DROP COLUMN "txid",
ADD COLUMN     "fee" DECIMAL(20,8) NOT NULL,
ADD COLUMN     "originalAmount" DECIMAL(20,8) NOT NULL,
ADD COLUMN     "transactionHash" TEXT,
DROP COLUMN "foreignId",
ADD COLUMN     "foreignId" UUID NOT NULL,
ALTER COLUMN "confirmations" SET NOT NULL,
ALTER COLUMN "confirmations" DROP DEFAULT,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "PaymentType" NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL;

-- DropTable
DROP TABLE "DepositAddress";

-- DropTable
DROP TABLE "LastDeposit";

-- DropEnum
DROP TYPE "PaymentTxStatusEnum";

-- DropEnum
DROP TYPE "PaymentTxTypeEnum";

-- CreateTable
CREATE TABLE "PaymentOrder" (
    "id" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "cancelReason" TEXT,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_transactionId_key" ON "PaymentOrder"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_foreignId_key" ON "PaymentTransaction"("foreignId");

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PaymentTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
