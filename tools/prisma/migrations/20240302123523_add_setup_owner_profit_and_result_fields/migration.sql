-- CreateEnum
CREATE TYPE "GameSetupResultEnum" AS ENUM ('REJECTED', 'STOP_LOSS', 'TAKE_PROFIT');

-- AlterTable
ALTER TABLE "GameSetup" ADD COLUMN     "ownerProfit" DECIMAL(20,8),
ADD COLUMN     "result" "GameSetupResultEnum";
