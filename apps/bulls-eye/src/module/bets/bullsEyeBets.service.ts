import { Decimal } from 'decimal.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  BetResultEnum,
  BetTypeEnum,
  BetBullseye,
  GameStateEnum,
  GameTypeEnum,
  Prisma,
} from '@prisma/client';
import { DateTime } from 'luxon';
import { GameLedgerService } from '@xyro/libs/ledger';
import { PrismaErrorTypesEnum } from '@xyro/libs/utils';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';
import {
  BULLS_EYE_BET_CACHE_TTL_SEC,
  BullsEyeBetChangedDomainEvent,
  BullsEyeGameChangedDomainEvent,
  getBullsEyeBetCacheKey
} from '@xyro/contracts/bulls-eye';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import { RedisService } from '@xyro/libs/redis';

import { DBTransaction, PrismaService } from '../../infrastructure/prisma';
import { BullsEyeGameService } from '../game/bullsEyeGame.service';

type AddBullsEyeBetParams = {
  gameId: string;
  price: number;
  userId: string;
};

const GET_GAME_LIMIT_BY_TIME_IN_DAYS = 24;

type GetBullsEyeGamesPaginatedParams = {
  skip?: number;
  take?: number;
};

type GetBullsEyeBetsPaginatedParams = GetBullsEyeGamesPaginatedParams & {
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
export class BullsEyeBetsService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly bullsEyeGameService: BullsEyeGameService,
    private readonly ledgerService: GameLedgerService,
    private readonly redisService: RedisService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
  ) {
    this.logger.setContext(BullsEyeBetsService.name);
  }

  public async addBet({
    userId,
    price,
  }: AddBullsEyeBetParams): Promise<BetBullseye> {
    const currentGame = await this.bullsEyeGameService.getCurrentGameFromCache();

    if (!currentGame) {
      throw new BadRequestException(`We didn't find Bulls-Eye game.`);
    }

    if (DateTime.fromJSDate(currentGame.stopBetsAt!) <= DateTime.now()) {
      throw new BadRequestException('Bulls-Eye game has already started.');
    }

    try {
      const { createdBet, updatedBalance } = await this.prismaService.$transaction(async (dbTransaction: DBTransaction) => {
        const bet = await dbTransaction.betBullseye.create({
          data: {
            gameType: GameTypeEnum.BULLSEYE,
            ownerId: userId,
            gameId: currentGame.id,
            type: BetTypeEnum.PRICE,
            result: BetResultEnum.OPEN,
            price,
            amount: currentGame.amount,
          },
        });

        const updatedBalance = await this.ledgerService.createBet(
          userId,
          new Decimal(currentGame.amount),
          currentGame.id,
          bet.id,
          GameTypeEnum.BULLSEYE,
          dbTransaction,
        );

        try {
          await this.redisService.set<BetBullseye>(
            getBullsEyeBetCacheKey(currentGame.id, bet.id),
            bet,
            {
              expiresInSeconds: BULLS_EYE_BET_CACHE_TTL_SEC,
            }
          );
        } catch (error) {
          this.logger.error({
            action: 'Error occured on setting bulls-eye bet cache',
            payload: {
              errorMessage: error.message,
              errorStack: error.stack,
            }
          })
          throw new InternalServerErrorException(`Bulls-Eye game creation failed.`);
        }

        return {
          updatedBalance,
          createdBet: bet,
        };
      });

      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new BullsEyeGameChangedDomainEvent(currentGame)),
      ]);

      await Promise.allSettled([
        this.domainEventsPublisher.publish(new BullsEyeBetChangedDomainEvent(createdBet)),
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

  public async getBullsEyeBetsPaginated(
    params: GetBullsEyeBetsPaginatedParams,
  ): Promise<BetBullseye[]> {
    const where: {
      AND: Prisma.BetBullseyeWhereInput[];
      game: Prisma.GameBullseyeWhereInput | undefined;
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

    const userBets = await this.prismaService.betBullseye.findMany({
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
