/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,gameId]` on the table `BetSetup` will be added. If there are existing duplicate values, this will fail.

*/

-- CreateIndex
CREATE UNIQUE INDEX "BetSetup_ownerId_gameId_key" ON "BetSetup"("ownerId", "gameId");
