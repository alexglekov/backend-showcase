import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@xyro/libs/logger';
import { GameStateEnum } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma';
import { OneVsOneGamesFinalizerService } from '../oneVsOne.finalizier';

@Injectable()
export class OneVsOneCloseWorker {
  private isWorking = false;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly oneVsOneGamesFinalizerService: OneVsOneGamesFinalizerService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(OneVsOneCloseWorker.name);
  }

  @Cron(CronExpression.EVERY_SECOND)
  async hanlde() {
    if (this.isWorking) return;

    try {
      this.isWorking = true;

      const foundPendingGames = await this.prismaService.game1vs1.findMany({
        where: {
          state: GameStateEnum.PENDING,
        },
        select: {
          id: true,
        },
        take: 10,
      });
      const gameIds = foundPendingGames.map((game) => game.id);

      if (gameIds.length > 0) {
        this.logger.log({
          action: 'Game PickUped',
          payload: {
            gameIds,
          },
        });
        this.oneVsOneGamesFinalizerService.resolveGame(gameIds);
      }

      this.isWorking = false;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      this.isWorking = false;
    } finally {
    }
  }
}
