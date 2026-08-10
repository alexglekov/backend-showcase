import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  BetResultEnum,
  BetTypeEnum,
  DirectionEnum,
  Game1vs1,
  GameStateEnum,
  GameTypeEnum,
} from '@prisma/client';
import { DateTime } from 'luxon';
import { PricesService } from '@xyro/contracts/prices';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';
import { Decimal } from 'decimal.js';
import { LoggerService } from '@xyro/libs/logger';
import { GameLedgerService } from '@xyro/libs/ledger';
import { ConfigService } from '@nestjs/config';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { OneVsOneBetChangedDomainEvent, OneVsOneGameChangedDomainEvent } from '@xyro/contracts/one-vs-one';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';

import { DBTransaction, PrismaService } from '../../infrastructure/prisma';
import { Config } from '../../infrastructure/config';

type OneVsOneGamesPaginatedParams = {
  userId?: string;
  skip?: number;
  take?: number;
};

type GetGlobalOneVsOneGamesParams = OneVsOneGamesPaginatedParams;

type GetPersonalOneVsOneGamesParams = {
  userId: string;
} & OneVsOneGamesPaginatedParams;

type GetOwnOneVsOneGamesParams = {
  userId: string;
  isOpen?: boolean;
} & OneVsOneGamesPaginatedParams;

type CreateOneVsOneGameParams = {
  ownerId: string;
  assetId: string;
  timeframe: number;
  isPrivate: boolean;
  isExact: boolean;
  direction?: DirectionEnum;
  opponentId?: string;
  betAmount: number;
  betPrice?: number;
};

type RejectOneVsOneGameParams = {
  userId: string;
  gameId: string;
};

const COUNT_MAX_OPEN_GAMES_IN_TIME = 3;

@Injectable()
export class OneVsOneGameService {
  constructor(
    @Inject(AppsNames.Prices) private readonly pricesService: PricesService,
    private readonly prismaService: PrismaService,
    protected readonly logger: LoggerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly ledgerService: GameLedgerService,
    private readonly configService: ConfigService<Config>
  ) {
    this.logger.setContext(OneVsOneGameService.name);
  }

  public async createGame(params: CreateOneVsOneGameParams): Promise<Game1vs1> {
    const countOpenedGames = await this.prismaService.game1vs1.count({
      where: {
        ownerId: params.ownerId,
        state: {
          in: [GameStateEnum.INPROGRESS, GameStateEnum.OPEN],
        }
      }
    });

    if (!(countOpenedGames < COUNT_MAX_OPEN_GAMES_IN_TIME)) {
      throw new BadRequestException(`You can't open more then ${COUNT_MAX_OPEN_GAMES_IN_TIME} game`);
    }

    const { dbTransactionTimeout } = this.configService.get('app');

    const currentPrice = await this.getCurrentPrice(params.assetId);

    const startAt = DateTime.fromJSDate(new Date());
    // please, note that timeframe is in seconds!
    const endAt = startAt.plus({ seconds: params.timeframe });
    const stopBetsAt = startAt.plus({ seconds: params.timeframe / 3 });

    const {
      createdGame,
      createdBet,
      updatedBalance,
    } =
      await this.prismaService.$transaction(
        async (dbTransaction: DBTransaction) => {
          const game = await dbTransaction.game1vs1.create({
            data: {
              type: GameTypeEnum.ONEVSONE,
              assetId: params.assetId,
              startPrice: currentPrice,
              timeframe: params.timeframe,
              state: GameStateEnum.OPEN,
              stopBetsAt: stopBetsAt.toJSDate(),
              startAt: startAt.toJSDate(),
              endAt: endAt.toJSDate(),
              data: {},
              pools: {},
              isExact: params.isExact,
              isPrivate: params.isPrivate,
              direction: params.direction,
              ownerId: params.ownerId,
              opponentId: params.opponentId,
            },
            include: {
              bets: true,
            },
          });

          const bet = await dbTransaction.bet1vs1.create({
            data: {
              gameType: GameTypeEnum.ONEVSONE,
              gameId: game.id,
              ownerId: game.ownerId,
              type: params.isExact ? BetTypeEnum.PRICE : BetTypeEnum.UPDOWN,
              amount: params.betAmount,
              price: params.betPrice,
              isUp: params.direction === DirectionEnum.UP,
              result: BetResultEnum.OPEN,
            },
          });

          const updatedBalance = await this.ledgerService.createBet(
            game.ownerId,
            new Decimal(params.betAmount),
            game.id,
            bet.id,
            GameTypeEnum.ONEVSONE,
            dbTransaction
          );

          return {
            createdGame: { ...game, bets: [...game.bets, bet] },
            updatedBalance,
            createdBet: bet,
          };
        },
        {
          timeout: dbTransactionTimeout,
        }
      );

    try {
      await Promise.allSettled([
        this.domainEventsPublisher.publish(
          new BalanceUpdatedDomainEvent({
            accountId: updatedBalance.accountId,
            amount: updatedBalance.amount,
            id: updatedBalance.id!,
            createdAt: updatedBalance.createdAt,
          })
        ),
        this.domainEventsPublisher.publish(new OneVsOneGameChangedDomainEvent(createdGame)),
        this.domainEventsPublisher.publish(new OneVsOneBetChangedDomainEvent(createdBet)),
      ])
    } catch {}

    this.logger.log({
      action: 'Created game',
      payload: {
        gameId: createdGame.id,
      },
    });

    return createdGame;
  }

  public async rejectGame(params: RejectOneVsOneGameParams) {
    const foundGame = await this.prismaService.game1vs1.findFirst({
      where: {
        AND: [
          {
            id: params.gameId,
          },
        ],
        OR: [
          {
            opponentId: params.userId,
          },
          {
            ownerId: params.userId,
          },
        ],
      },
      include: {
        bets: true,
      },
    });

    if (!foundGame) {
      throw new BadRequestException('Game not found');
    }

    if (foundGame.state !== GameStateEnum.OPEN) {
      throw new BadRequestException('Game cannot be rejected');
    }

    const [finishedGame] = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const [updatedGame] = await Promise.all([
          dbTransaction.game1vs1.update({
            where: {
              id: params.gameId,
            },
            data: {
              state: GameStateEnum.PENDING,
              opponentId: params.userId,
            },
          }),
          dbTransaction.bet1vs1.updateMany({
            where: {
              gameId: params.gameId,
            },
            data: {
              result: BetResultEnum.PENDING,
            },
          }),
        ]);
        
        return [updatedGame];
      }
    );

    await this.domainEventsPublisher.publish(new OneVsOneGameChangedDomainEvent(finishedGame));

    this.logger.log({
      action: 'Reject game',
      payload: {
        gameId: finishedGame.id,
      },
    });

    return finishedGame;
  }

  async getAvailableGlobalOneVsOneGames(params: GetGlobalOneVsOneGamesParams) {
    return this.prismaService.game1vs1.findMany({
      where: {
        isPrivate: false,
        state: {
          in: [GameStateEnum.OPEN],
        },
      },
      include: { bets: true },
      orderBy: {
        createdAt: 'desc',
      },
      skip: params.skip,
      take: params.take,
    });
  }

  async getAvailablePersonalOneVsOneGames(
    params: GetPersonalOneVsOneGamesParams
  ) {
    return this.prismaService.game1vs1.findMany({
      where: {
        isPrivate: true,
        opponentId: params.userId,
        state: {
          in: [GameStateEnum.OPEN],
        },
      },
      include: { bets: true },
      orderBy: {
        createdAt: 'desc',
      },
      skip: params.skip,
      take: params.take,
    });
  }

  async getOwnOneVsOneGames(params: GetOwnOneVsOneGamesParams) {
    return this.prismaService.game1vs1.findMany({
      where: {
        OR: [
          {
            opponentId: params.userId,
            bets: {
              some: {
                ownerId: params.userId,
              }
            }
          },
          {
            ownerId: params.userId,
          },
        ],
        AND: [
          {
            state: {
              in: params.isOpen
                ? [GameStateEnum.OPEN, GameStateEnum.INPROGRESS]
                : [GameStateEnum.CLOSE, GameStateEnum.PENDING],
            },
          },
        ],
      },
      include: { bets: true },
      orderBy: {
        createdAt: 'desc',
      },
      skip: params.skip,
      take: params.take,
    });
  }

  async getOneVsOneGameById(gameId: string) {
    return this.prismaService.game1vs1.findFirst({
      where: {
        id: gameId,
      },
      include: { bets: true },
    });
  }

  async getOneVsOneGamesCount(userId: string) {
    const activeGamesCount = await this.prismaService.game1vs1.count({
      where: {
        OR: [
          {
            ownerId: userId,
            state: { in: [GameStateEnum.OPEN, GameStateEnum.INPROGRESS] },
          },
          {
            opponentId: userId,
            state: { in: [GameStateEnum.OPEN, GameStateEnum.INPROGRESS] },
          },
        ],
      },
    });

    const inviteGamesCount = await this.prismaService.game1vs1.count({
      where: {
        isPrivate: true,
        state: GameStateEnum.OPEN,
        opponentId: userId,
      },
    });

    const closeGamesCount = await this.prismaService.game1vs1.count({
      where: {
        OR: [
          {
            ownerId: userId,
            state: { in: [GameStateEnum.CLOSE, GameStateEnum.PENDING] },
          },
          {
            opponentId: userId,
            state: { in: [GameStateEnum.CLOSE, GameStateEnum.PENDING] },
          },
        ],
      },
    });
    return { activeGamesCount, closeGamesCount, inviteGamesCount };
  }

  private async getCurrentPrice(assetId: string) {
    const currentPrice = await lastValueFrom(
      this.pricesService.getAssetCurrentPrice({ assetId })
    );

    return new Decimal(currentPrice.price);
  }
}
