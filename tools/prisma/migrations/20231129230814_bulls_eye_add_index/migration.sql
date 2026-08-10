/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,gameId]` on the table `BetBullseye` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BetBullseye_ownerId_gameId_key" ON "BetBullseye"("ownerId", "gameId");
