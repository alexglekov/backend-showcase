-- CreateEnum
CREATE TYPE "BetTypeEnum" AS ENUM ('PRICE', 'UPDOWN');

-- CreateEnum
CREATE TYPE "BetResultEnum" AS ENUM ('WON', 'LOSS', 'REJECT', 'PENDING', 'INPROGRESS', 'OPEN');

-- CreateEnum
CREATE TYPE "FeeTypeEnum" AS ENUM ('FLAT_FEE', 'PNL_FEE');

-- CreateTable
CREATE TABLE "Bet" (
    "id" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "type" "BetTypeEnum" NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "fee" DECIMAL(20,8),
    "pnl" DECIMAL(20,8),
    "result" "BetResultEnum" NOT NULL DEFAULT 'INPROGRESS',
    "outcome" DECIMAL(20,8),
    "price" DECIMAL(20,8),
    "isUp" BOOLEAN,
    "priceResult" DECIMAL(20,8),
    "isUpResult" BOOLEAN,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bet1vs1" (

    CONSTRAINT "Bet1vs1_pkey" PRIMARY KEY ("id")
) INHERITS ("Bet");

-- CreateTable
CREATE TABLE "BetSetup" (

    CONSTRAINT "BetSetup_pkey" PRIMARY KEY ("id")
) INHERITS ("Bet");

-- CreateTable
CREATE TABLE "BetBullseye" (
    "isExact" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BetBullseye_pkey" PRIMARY KEY ("id")
) INHERITS ("Bet");

-- CreateTable
CREATE TABLE "BetUpDown" (

    CONSTRAINT "BetUpDown_pkey" PRIMARY KEY ("id")
) INHERITS ("Bet");

-- CreateTable
CREATE TABLE "BetX1000" (
    "roi" DECIMAL(20,8),
    "feeType" "FeeTypeEnum" NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3) NOT NULL,
    "startPrice" DECIMAL(20,8) NOT NULL,
    "endPrice" DECIMAL(20,8),
    "isLong" BOOLEAN NOT NULL,
    "takeProfit" DECIMAL(20,8),
    "stopLoss" DECIMAL(20,8),
    "burnPrice" DECIMAL(20,8),

    CONSTRAINT "BetX1000_pkey" PRIMARY KEY ("id")
)  INHERITS ("Bet");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet1vs1" ADD CONSTRAINT "Bet1vs1_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet1vs1" ADD CONSTRAINT "Bet1vs1_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game1vs1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSetup" ADD CONSTRAINT "BetSetup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetSetup" ADD CONSTRAINT "BetSetup_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameSetup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetBullseye" ADD CONSTRAINT "BetBullseye_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetBullseye" ADD CONSTRAINT "BetBullseye_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameBullseye"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetUpDown" ADD CONSTRAINT "BetUpDown_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetUpDown" ADD CONSTRAINT "BetUpDown_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameUpDown"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetX1000" ADD CONSTRAINT "BetX1000_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetX1000" ADD CONSTRAINT "BetX1000_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "GameX1000"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
