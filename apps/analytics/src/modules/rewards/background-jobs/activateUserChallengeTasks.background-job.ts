import {
  UserChallengeTaskUpdatedDomainEvent,
  UserChallengeTaskUpdatedDomainEventPayload,
} from '@xyro/contracts/analytics';
import { EventPayload, EventsListener, DomainEventsPublisher, SubscribeDomainEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { Prisma, UserChallengeTask, UserChallengeTaskStatus } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma';

@EventsListener()
export class ActivateUserChallengeTasksBackgroundJob {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
  ) {}

  @SubscribeDomainEvent(UserChallengeTaskUpdatedDomainEvent)
  async onUserChallengeTaskUpdated(@EventPayload() payload: UserChallengeTaskUpdatedDomainEventPayload) {
    const { userId } = payload;

    const { userChallengeTasksIds } = await this.getUserChallengeTasksToBeActivated(userId);

    this.logger.log({
      action: 'Found user challenge tasks to be activated',
      userId,
      userChallengeTasksIds,
    });

    if (userChallengeTasksIds.length === 0) return;

    const { updatedUserChallengeTasks } = await this.updateAndGetTasks(userChallengeTasksIds);

    this.logger.log({
      action: 'User challenge tasks were activated',
      userId,
      userChallengeTasksIds,
    });

    await Promise.allSettled(
      updatedUserChallengeTasks.map(
        (userChallengeTask) => this.domainEventsPublisher.publish(new UserChallengeTaskUpdatedDomainEvent(userChallengeTask))
      )
    );
  }

  private async getUserChallengeTasksToBeActivated(userId: string) {
    const userChallengeTasksToBeActivated = await this.prismaService.$queryRaw<
      Pick<UserChallengeTask, 'id'>[]
    >(
      Prisma.sql`
        SELECT uct.id
        FROM "UserChallengeTask" uct
                JOIN "ChallengeTask" ct ON ct.id = uct."taskId"
                JOIN "UserChallengeTask" uct2 ON uct2."taskId" = ct."blockedByTaskId"
        WHERE uct."isActive" = false
          AND uct."userId" = ${userId}::uuid
          AND uct2."userId" = ${userId}::uuid
          AND uct2.status IN
              (CAST(${UserChallengeTaskStatus.CLAIMED}::text AS "UserChallengeTaskStatus"),
              CAST(${UserChallengeTaskStatus.COMPLETED}::text AS "UserChallengeTaskStatus"))
          AND uct2."isActive" = true;
      `
    );

    const userChallengeTasksIds = userChallengeTasksToBeActivated.map((userChallengeTask) => userChallengeTask.id);

    return {
      userChallengeTasksIds,
    }
  }

  async updateAndGetTasks(userChallengeTasksIds: string[]) {
    await this.prismaService.userChallengeTask.updateMany({
      where: {
        id: {
          in: userChallengeTasksIds
        }
      },
      data: {
        isActive: true,
      }
    });

    const updatedUserChallengeTasks = await this.prismaService.userChallengeTask.findMany({
      where: {
        id: {
          in: userChallengeTasksIds,
        },
      },
    });

    return {
      updatedUserChallengeTasks,
    };
  }
}