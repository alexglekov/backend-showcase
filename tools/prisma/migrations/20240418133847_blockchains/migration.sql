-- CreateTable
CREATE TABLE "Blockchain" (
    "network" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "lastScanBlock" BIGINT NOT NULL,

    CONSTRAINT "Blockchain_pkey" PRIMARY KEY ("network")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blockchain_chainId_key" ON "Blockchain"("chainId");

INSERT INTO "Blockchain" VALUES ('arbitrum',42161, 190242088);
INSERT INTO "Blockchain" VALUES ('eth-sepolia', 11155111, 5605581);
