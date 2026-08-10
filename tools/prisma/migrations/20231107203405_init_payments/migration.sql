-- CreateEnum
CREATE TYPE "PaymentTxTypeEnum" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateEnum
CREATE TYPE "PaymentTxStatusEnum" AS ENUM ('PENDING', 'CONFIRMED', 'NOT_CONFIRMED');


-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" UUID NOT NULL,
    "txid" TEXT,
    "ownerId" UUID NOT NULL,
    "foreignId" TEXT,
    "paymentSystem" TEXT NOT NULL,
    "confirmations" INTEGER DEFAULT 0,
    "status" "PaymentTxStatusEnum" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "type" "PaymentTxTypeEnum" NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "amountUsd" DECIMAL(20,8),
    "address" TEXT NOT NULL,
    "fees" DECIMAL(20,8),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "LastDeposit" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "paymentSystem" TEXT NOT NULL,

    CONSTRAINT "LastDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositAddress" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "currency" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "paymentSystem" TEXT NOT NULL,

    CONSTRAINT "DepositAddress_pkey" PRIMARY KEY ("id")
);


-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_foreignId_paymentSystem_key" ON "PaymentTransaction"("foreignId", "paymentSystem");

-- CreateIndex
CREATE UNIQUE INDEX "LastDeposit_address_key" ON "LastDeposit"("address");

-- CreateIndex
CREATE UNIQUE INDEX "LastDeposit_ownerId_currency_key" ON "LastDeposit"("ownerId", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "DepositAddress_address_key" ON "DepositAddress"("address");

-- CreateIndex
CREATE INDEX "DepositAddress_ownerId_idx" ON "DepositAddress"("ownerId");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LastDeposit" ADD CONSTRAINT "LastDeposit_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositAddress" ADD CONSTRAINT "DepositAddress_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
