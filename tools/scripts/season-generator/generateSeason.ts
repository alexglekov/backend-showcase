import { PrismaClient } from '@prisma/client'

import { season, challenges, tasks } from './season-configurations';

async function startGenerateSeason() {
  const prisma = new PrismaClient();

  await prisma.$connect();

  await prisma.$transaction(async (transaction) => {
    await transaction.season.create({
      data: season,
    });

    await Promise.all(challenges.map((challenge) => transaction.seasonChallenge.create({ data: challenge })));

    for (const task of tasks) {
      await transaction.challengeTask.create({
        data: task,
      });
    }
  });

  await prisma.$disconnect();
}

startGenerateSeason();
