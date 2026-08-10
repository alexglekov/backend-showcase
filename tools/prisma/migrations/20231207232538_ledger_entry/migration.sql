-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('userDeposit', 'userWithdraw', 'hourlyFee', 'userAddBet', 'gameResolve', 'userRejectedBet', 'userWon', 'userLose', 'notDefined');

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "details" TEXT NOT NULL DEFAULT 'No details',
ADD COLUMN     "type" "EntryType" NOT NULL DEFAULT 'notDefined';
