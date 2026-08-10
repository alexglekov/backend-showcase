import { PrismaClient } from '@prisma/client'

async function dropGenerateSeason() {
  const prisma = new PrismaClient();

  await prisma.$connect();

  await prisma.$transaction(async (transaction) => {
    await transaction.userChallengeTask.deleteMany();
    await transaction.reward.deleteMany();
    await transaction.challengeTask.deleteMany();
    await transaction.seasonChallenge.deleteMany();
    await transaction.season.deleteMany();
  });

  await prisma.$disconnect();
}

dropGenerateSeason();
