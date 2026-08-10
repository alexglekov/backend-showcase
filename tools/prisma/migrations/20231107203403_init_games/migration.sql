-- CreateEnum
CREATE TYPE "GameTypeEnum" AS ENUM ('ONEVSONE', 'SETUP', 'BULLSEYE', 'UPDOWN', 'X1000');

-- CreateEnum
CREATE TYPE "DirectionEnum" AS ENUM ('UP', 'DOWN');

-- CreateEnum
CREATE TYPE "GameStateEnum" AS ENUM ('DRAFT', 'OPEN', 'INPROGRESS', 'PENDING', 'CLOSE');

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "type" "GameTypeEnum" NOT NULL,
    "assetId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3),
    "stopBetsAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "startPrice" DECIMAL(20,8),
    "endPrice" DECIMAL(20,8),
    "timeframe" INTEGER NOT NULL,
    "state" "GameStateEnum" NOT NULL,
    "data" JSONB NOT NULL,
    "pools" JSONB NOT NULL,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game1vs1" (
    "ownerId" UUID NOT NULL,
    "opponentId" UUID,
    "isPrivate" BOOLEAN NOT NULL,
    "isExact" BOOLEAN NOT NULL,
    "direction" "DirectionEnum",

    CONSTRAINT "Game1vs1_pkey" PRIMARY KEY ("id")
) INHERITS ("Game");

-- CreateTable
CREATE TABLE "GameSetup" (
    "ownerId" UUID NOT NULL,
    "isLong" BOOLEAN NOT NULL,
    "takeProfit" DECIMAL(20,8) NOT NULL,
    "stopLoss" DECIMAL(20,8) NOT NULL,
    "meta" JSONB NOT NULL,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "maxMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "GameSetup_pkey" PRIMARY KEY ("id")
) INHERITS ("Game");

-- CreateTable
CREATE TABLE "GameBullseye" (
    "amount" DECIMAL(20,8) NOT NULL,
    "winnerId" UUID,
    "winnerBetId" UUID,

    CONSTRAINT "GameBullseye_pkey" PRIMARY KEY ("id")
) INHERITS ("Game");

-- CreateTable
CREATE TABLE "GameUpDown" (
    "isUp" BOOLEAN,

    CONSTRAINT "GameUpDown_pkey" PRIMARY KEY ("id")
) INHERITS ("Game");

-- CreateTable
CREATE TABLE "GameX1000" (
    "ownerId" UUID NOT NULL,

    CONSTRAINT "GameX1000_pkey" PRIMARY KEY ("id")
) INHERITS ("Game");

-- AlterTable
ALTER TABLE "GameX1000" ALTER COLUMN "timeframe" DROP NOT NULL,
ALTER COLUMN "timeframe" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game1vs1" ADD CONSTRAINT "Game1vs1_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game1vs1" ADD CONSTRAINT "Game1vs1_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game1vs1" ADD CONSTRAINT "Game1vs1_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSetup" ADD CONSTRAINT "GameSetup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSetup" ADD CONSTRAINT "GameSetup_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameBullseye" ADD CONSTRAINT "GameBullseye_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameUpDown" ADD CONSTRAINT "GameUpDown_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameX1000" ADD CONSTRAINT "GameX1000_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameX1000" ADD CONSTRAINT "GameX1000_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
