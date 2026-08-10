/*
  Warnings:

  - Added the required column `updatedAt` to the `BackofficeUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PaymentOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BackofficeUser" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PaymentOrder" ADD COLUMN     "blameId" UUID,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "blameId" UUID,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_blameId_fkey" FOREIGN KEY ("blameId") REFERENCES "BackofficeUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOrder" ADD CONSTRAINT "PaymentOrder_blameId_fkey" FOREIGN KEY ("blameId") REFERENCES "BackofficeUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
