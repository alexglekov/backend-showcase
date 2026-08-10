/*
  Warnings:

  - A unique constraint covering the columns `[state]` on the table `GameUpDown` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "NftHolder" (
    "address" TEXT NOT NULL,
    "common" INTEGER NOT NULL,
    "rare" INTEGER NOT NULL,
    "epic" INTEGER NOT NULL,
    "legendary" INTEGER NOT NULL,

    CONSTRAINT "NftHolder_pkey" PRIMARY KEY ("address")
);
