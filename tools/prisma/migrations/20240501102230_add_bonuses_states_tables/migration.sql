-- CreateTable
CREATE TABLE "UserNftBonusState" (
    "address" CITEXT NOT NULL,
    "common" INTEGER NOT NULL,
    "rare" INTEGER NOT NULL,
    "epic" INTEGER NOT NULL,
    "legendary" INTEGER NOT NULL,

    CONSTRAINT "UserNftBonusState_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "UserBonusState" (
    "address" CITEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "isReceived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserBonusState_pkey" PRIMARY KEY ("address")
);
