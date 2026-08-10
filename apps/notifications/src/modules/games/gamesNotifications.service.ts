import { Injectable } from '@nestjs/common';
import { GameStateEnum, GameTypeEnum, NotificationType } from '@prisma/client';
// import { Bu } from '@xyro/contracts/bulls-eye';
import { OneVsOneGameChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';
import { SetupGameChangedDomainEventPayload } from '@xyro/contracts/setups';
import { UpDownGameChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { X1000GameChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { NotificationCreatedDomainEvent } from '@xyro/contracts/notifications';
import { DomainEventsPublisher } from '@xyro/libs/events';

import { PrismaService } from '../../infrastructure/prisma';
import { 
  OneVsOneGameResultPayload,
  SetupGameResultPayload,
  X1000GameResultPayload,
  UpDownGameResultPayload,
  BullsEyeGameResultPayload,
} from './gamesNotificationPayload.interfaces';
import { BullsEyeGameChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';

@Injectable()
export class GamesNotificationsService {
  constructor(
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly prismaService: PrismaService,
  ) {}

  async onUpDownGameChanged(payload: UpDownGameChangedDomainEventPayload) {
    if (payload.state !== GameStateEnum.CLOSE) return;

    const game = await this.prismaService.gameUpDown.findFirstOrThrow({
      where: {
        id: payload.id
      },
      include: {
        bets: true,
      }
    });

    for (const bet of game.bets) {
      const body: UpDownGameResultPayload = {
        gameType: GameTypeEnum.UPDOWN,
        result: bet.result,
        outcome: bet.outcome ? Number(bet.outcome) : undefined,
        amount: bet.amount ? Number(bet.amount) : undefined,
      }; 
  
      const notification = await this.prismaService.notifications.create({
        data: {
          body: body as any,
          type: NotificationType.gameResult,
          userId: bet.ownerId,
        },
      });

      await this.domainEventsPublisher.publish(new NotificationCreatedDomainEvent(notification));
    }
  }

  async onX1000GameChanged(payload: X1000GameChangedDomainEventPayload) {
    if (payload.state !== GameStateEnum.CLOSE) return;

    const game = await this.prismaService.gameX1000.findFirstOrThrow({
      where: {
        id: payload.id
      },
      include: {
        bets: true,
      }
    });

    for (const bet of game.bets) {
      const body: X1000GameResultPayload = {
        gameType: GameTypeEnum.X1000,
        result: bet.result,
        outcome: bet.outcome ? Number(bet.outcome) : undefined,
        amount: bet.outcome ? Number(bet.amount) : undefined,
      };

      const notification = await this.prismaService.notifications.create({
        data: {
          body: body as any,
          type: NotificationType.gameResult,
          userId: bet.ownerId,
        },
      });

      await this.domainEventsPublisher.publish(new NotificationCreatedDomainEvent(notification));
    }
  }

  async onBullsEyeGameChanged(payload: BullsEyeGameChangedDomainEventPayload) {
    if (payload.state !== GameStateEnum.CLOSE) return;

    const game = await this.prismaService.gameBullseye.findFirstOrThrow({
      where: {
        id: payload.id
      },
      include: {
        bets: true,
      }
    });

    const winnerBet = game.bets.find((bet) => bet.id === game.winnerBetId);

    for (const bet of game.bets) {
      const body: BullsEyeGameResultPayload = {
        gameType: GameTypeEnum.BULLSEYE,
        result: bet.result,
        isExact: winnerBet ? winnerBet.isExact : undefined,
        winnerId: winnerBet ? winnerBet.id : undefined,
        winnerOutcome: winnerBet ? Number(winnerBet.outcome) : undefined,
        outcome: bet.outcome ? Number(bet.outcome) : undefined,
        amount: game.amount ? Number(game.amount) : undefined,
      };

      const notification = await this.prismaService.notifications.create({
        data: {
          body: body as any,
          type: NotificationType.gameResult,
          userId: bet.ownerId,
        },
      });

      await this.domainEventsPublisher.publish(new NotificationCreatedDomainEvent(notification));
    }
  }

  async onOneVsOneGameChanged(payload: OneVsOneGameChangedDomainEventPayload) {
    if (payload.state !== GameStateEnum.CLOSE) return;

    const game = await this.prismaService.game1vs1.findFirstOrThrow({
      where: {
        id: payload.id
      },
      include: {
        bets: true,
      }
    });

    for (const bet of game.bets) {
      const body: OneVsOneGameResultPayload = {
        gameType: GameTypeEnum.ONEVSONE,
        result: bet.result,
        outcome: bet.outcome ? Number(bet.outcome) : undefined,
        amount: bet.amount ? Number(bet.amount) : undefined,
        opponentId: game.ownerId === bet.ownerId ? game.opponentId || undefined : game.ownerId,
      };

      const notification = await this.prismaService.notifications.create({
        data: {
          body: body as any,
          type: NotificationType.gameResult,
          userId: bet.ownerId,
        },
      });

      await this.domainEventsPublisher.publish(new NotificationCreatedDomainEvent(notification));
    }
  }

  async onSetupGameChanged(payload: SetupGameChangedDomainEventPayload) {
    if (payload.state !== GameStateEnum.CLOSE) return;

    const game = await this.prismaService.gameSetup.findFirstOrThrow({
      where: {
        id: payload.id
      },
      include: {
        bets: true,
      }
    });

    for (const bet of game.bets) {
      const body: SetupGameResultPayload = {
        gameType: GameTypeEnum.SETUP,
        result: bet.result,
        outcome: bet.outcome ? Number(bet.outcome) : undefined,
        amount: bet.amount ? Number(bet.amount) : undefined,
      };

      const notification = await this.prismaService.notifications.create({
        data: {
          body: body as any,
          type: NotificationType.gameResult,
          userId: bet.ownerId,
        },
      });

      await this.domainEventsPublisher.publish(new NotificationCreatedDomainEvent(notification));
    }
  }
}