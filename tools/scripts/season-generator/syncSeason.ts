import { PrismaClient } from '@prisma/client'

import { season, challenges, tasks } from './season-configurations';

function difference(a: Array<string>, b: Array<string>) {
  if (a.length === 0) return b;

  var setA = new Set(a);
  var setB = new Set(b);
  var intersection = new Set([...setA].filter(x => !setB.has(x)));

  return Array.from(intersection);
}

async function syncSeason() {
  const prisma = new PrismaClient();

  await prisma.$connect();

  const usersIds = await prisma.user.findMany({ select: { id: true } });

  await prisma.$transaction(async (transaction) => {
    await transaction.season.upsert({
      where: {
        id: season.id,
      },
      create: season,
      update: season,
    });

    await Promise.all(
      challenges.map((challenge) => transaction.seasonChallenge.upsert({
        where: {
          id: challenge.id,
        },
        create: challenge,
        update: challenge,
      })
    ));

    for (const task of tasks) {
      const {
        challengeId,
        seasonId,
        usersRelatedTasks
      } = await transaction.challengeTask.upsert({
        relationLoadStrategy: 'join',
        where: {
          id: task.id,
        },
        create: task,
        update: task,
        select: {
          challengeId: true,
          seasonId: true,
          usersRelatedTasks: {
            select: {
              userId: true,
            }
          }
        }
      });


      if (usersRelatedTasks.length !== usersIds.length) {
        const usersDiff = difference(
          usersRelatedTasks.map((value) => value.userId),
          usersIds.map((value) => value.id)
        );

        await transaction.userChallengeTask.createMany({
          data: usersDiff.map((userId) => ({
            challengeId,
            seasonId,
            taskId: task.id,
            userId,
          })),
        });

        console.log(`For users ${usersDiff} challenge task ${task.id} created`);
      }
    }
  });

  await prisma.$disconnect();

  console.log('Sync season completed')
}

syncSeason();
