-- CreateEnum
CREATE TYPE "UserChallengeTaskStatus" AS ENUM ('NOT_COMPLETED', 'COMPLETED', 'CLAIMED');

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonChallenge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "seasonId" TEXT NOT NULL,

    CONSTRAINT "SeasonChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "pattern" TEXT NOT NULL,
    "blockedByTaskId" TEXT,
    "configuration" JSONB NOT NULL,
    "challengeId" TEXT NOT NULL,

    CONSTRAINT "ChallengeTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallengeTask" (
    "id" UUID NOT NULL,
    "seasonId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "status" "UserChallengeTaskStatus" NOT NULL DEFAULT 'NOT_COMPLETED',

    CONSTRAINT "UserChallengeTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "balanceId" UUID NOT NULL,
    "rewards" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lastPlace" DECIMAL(65,30),
    "currentPlace" DECIMAL(65,30),

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserChallengeTask_userId_taskId_key" ON "UserChallengeTask"("userId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_userId_key" ON "Reward"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_balanceId_key" ON "Reward"("balanceId");

-- AddForeignKey
ALTER TABLE "SeasonChallenge" ADD CONSTRAINT "SeasonChallenge_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTask" ADD CONSTRAINT "ChallengeTask_blockedByTaskId_fkey" FOREIGN KEY ("blockedByTaskId") REFERENCES "ChallengeTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTask" ADD CONSTRAINT "ChallengeTask_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeTask" ADD CONSTRAINT "ChallengeTask_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "SeasonChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeTask" ADD CONSTRAINT "UserChallengeTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ChallengeTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeTask" ADD CONSTRAINT "UserChallengeTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeTask" ADD CONSTRAINT "UserChallengeTask_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeTask" ADD CONSTRAINT "UserChallengeTask_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "SeasonChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "Balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
