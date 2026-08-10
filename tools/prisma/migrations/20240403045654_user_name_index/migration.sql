/*
  Warnings:

  - Made the column `timeframe` on table `GameX1000` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GameX1000" ALTER COLUMN "timeframe" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User" USING HASH ("name");
