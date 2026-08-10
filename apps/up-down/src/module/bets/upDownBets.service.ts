import { Decimal } from 'decimal.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  BetResultEnum,
  BetTypeEnum,
  BetUpDown,
  GameStateEnum,
  GameTypeEnum,
  Prisma,
} from '@prisma/client';
import { DateTime } from 'luxon';
import { GameLedgerService } from '@xyro/libs/ledger';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';
import { UP_DOWN_BET_CACHE_TTL_SEC, UpDownBetChangedDomainEvent, UpDownGameChangedDomainEvent, getUpDownBetCacheKey } from '@xyro/contracts/up-down';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import { RedisService } from '@xyro/libs/redis';

import { DBTransaction, PrismaService } from '../../infrastructure/prisma';
import { UpDownGameService } from '../game/upDownGame.service';

type AddUpDownBetParams = {
  gameId: string;
  amount: number;
  isUp: boolean;
  userId: string;
};

const GET_GAME_LIMIT_BY_TIME_IN_DAYS = 1;

type GetUpDownGamesPaginatedParams = {
  skip?: number;
  take?: number;
};

type GetUpDownBetsPaginatedParams = GetUpDownGamesPaginatedParams & {
  ownerId?: string;
  betMin?: number;
  betMax?: number;
  profitMin?: number;
  profitMax?: number;
  isUp?: boolean;
  skip?: number;
  take?: number;
  latest?: boolean;
  status?: GameStateEnum;
};

@Injectable()
export class UpDownBetsService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly ledgerService: GameLedgerService,
    private readonly upDownGameService: UpDownGameService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly redisService: RedisService,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
  ) {
    this.logger.setContext(UpDownBetsService.name);
  }

  public async addBet({
    userId,
    amount,
    isUp,
  }: AddUpDownBetParams): Promise<BetUpDown> {
    const currentGame = await this.upDownGameService.getCurrentGameFromCache();

    if (
      DateTime.fromJSDate(new Date(currentGame.stopBetsAt!)) <= DateTime.now()
    ) {
      throw new BadRequestException('Up/Down game has already started.');
    }

    try {
      const { createdBet, updatedBalance } = await this.prismaService.$transaction(async (dbTransaction: DBTransaction) => {
        const bet = await dbTransaction.betUpDown.create({
          data: {
            gameType: GameTypeEnum.UPDOWN,
            ownerId: userId,
            gameId: currentGame.id,
            type: BetTypeEnum.UPDOWN,
            result: BetResultEnum.OPEN,
            amount,
            isUp,
          },
        });

        const updatedBalance = await this.ledgerService.createBet(
          userId,
          new Decimal(amount),
          currentGame.id,
          bet.id,
          GameTypeEnum.UPDOWN,
          dbTransaction,
        );

        try {
          await this.redisService.set<BetUpDown>(
            getUpDownBetCacheKey(currentGame.id, bet.id),
            bet,
            {
              expiresInSeconds: UP_DOWN_BET_CACHE_TTL_SEC,
            }
          );
        } catch (error) {
          this.logger.error({
            action: 'Error occured on setting up/down bet cache',
            payload: {
              errorMessage: error.message,
              errorStack: error.stack,
            }
          })
          throw new InternalServerErrorException(`Up/Down game creation failed.`);
        }

        return {
          updatedBalance,
          createdBet: bet,
        };
      });

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new UpDownGameChangedDomainEvent(currentGame)),
        this.domainEventsPublisher.publish(new UpDownBetChangedDomainEvent(createdBet)),
        this.domainEventsPublisher.publish(new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId!,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt!,
        })),
      ]);

      return createdBet;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.UniqueConstraintFailed) throw new BadRequestException('You are already in the game.')
      }

      throw new InternalServerErrorException(error);
    }
  }

  public async getUpDownBetsPaginated(
    params: GetUpDownBetsPaginatedParams,
  ): Promise<BetUpDown[]> {
    const where: {
      AND: Prisma.BetUpDownWhereInput[];
      game: Prisma.GameUpDownWhereInput | undefined;
    } = {
      AND: [],
      game: undefined,
    };

    if (params.latest || params.status) {
      where.game = {
        AND: [
          {
            endAt: params.latest
              ? {
                  gte: DateTime.fromJSDate(new Date())
                    .minus({
                      days: GET_GAME_LIMIT_BY_TIME_IN_DAYS,
                    })
                    .toJSDate(),
                }
              : undefined,
          },
          { state: params.status || undefined },
        ],
      };
    }

    if (params.ownerId) {
      where.AND = [
        ...where.AND,
        {
          ownerId: params.ownerId,
        },
      ];
    }

    if (params.betMin) {
      where.AND = [
        ...where.AND,
        {
          amount: {
            gte: params.betMin,
          },
        },
      ];
    }

    if (params.betMax) {
      where.AND = [
        ...where.AND,
        {
          amount: {
            lte: params.betMax,
          },
        },
      ];
    }

    if (params.profitMin) {
      where.AND = [
        ...where.AND,
        {
          pnl: {
            gte: params.profitMin,
          },
        },
      ];
    }

    if (params.profitMax) {
      where.AND = [
        ...where.AND,
        {
          pnl: {
            lte: params.profitMax,
          },
        },
      ];
    }

    if (params.isUp) {
      where.AND = [
        ...where.AND,
        {
          isUp: params.isUp,
        },
      ];
    }

    const userBets = await this.prismaService.betUpDown.findMany({
      relationLoadStrategy: 'join',
      where: {
        ...where,
        AND: where.AND.length === 0 ? undefined : where.AND
      },
      orderBy: {
        game: {
          endAt: 'desc',
        },
      },
      skip: params.skip,
      take: params.take,
      include: {
        game: true,
      },
    });

    return userBets;
  }
}
