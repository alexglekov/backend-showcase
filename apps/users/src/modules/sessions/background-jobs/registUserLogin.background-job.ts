import { SessionCreatedDomainEvent, SessionCreatedDomainEventPayload, SessionRefreshedDomainEvent, SessionRefreshedDomainEventPayload } from '@xyro/contracts/users';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';

import { PrismaService } from '../../../infrastructure/prisma';

@EventsListener()
export class RegistUserLoginBackgroundJob {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  @SubscribeDomainEvent(SessionCreatedDomainEvent)
  async onUserLogined(@EventPayload() payload: SessionCreatedDomainEventPayload) {
    const { userId, createdAt } = payload;

    try {
      await this.prismaService.userDailyLogin.create({
        data: {
          date: createdAt,
          userId,
        },
      });
    } catch {}
  }

  @SubscribeDomainEvent(SessionRefreshedDomainEvent)
  async onUserRefreshedSession(@EventPayload() payload: SessionRefreshedDomainEventPayload) {
    const { userId, updatedAt } = payload;

    try {
      await this.prismaService.userDailyLogin.create({
        data: {
          date: updatedAt,
          userId,
        },
      });
    } catch {}
  }
}
