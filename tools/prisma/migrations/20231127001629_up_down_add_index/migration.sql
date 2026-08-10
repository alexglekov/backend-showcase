/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,gameId]` on the table `BetUpDown` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BetUpDown_ownerId_gameId_key" ON "BetUpDown"("ownerId", "gameId");
