import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  BetResultEnum,
  BetTypeEnum,
  BetX1000,
  FeeTypeEnum,
  GameStateEnum,
  GameTypeEnum,
  GameX1000,
  Prisma,
} from '@prisma/client';
import { Decimal } from 'decimal.js';
import {
  calculateX1000BetBurnPrice,
  checkAddX1000BetParams,
  AppsNames,
  getX1000GameState,
  getX1000BetState
} from '@xyro/core';
import { PrismaTransaction } from '@xyro/libs/utils';
import { GameLedgerService } from '@xyro/libs/ledger';
import { PricesService } from '@xyro/contracts/prices';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { DomainEventsPublisher, StreamingEventsPublisher } from '@xyro/libs/events';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import {
  X1000BetChangedDomainEvent,
  X1000GameChangedDomainEvent,
} from '@xyro/contracts/x1000';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { X1000_FLAT_FEE } from '../constants';
import { Config } from '../../../infrastructure/config';

type CreateBetParams = {
  userId: string;
  multiplier: number;
  amount: number;
  isLong: boolean;
  takeProfit?: number;
  stopLoss?: number;
  feeType: FeeTypeEnum;
};

type CashBetOutParams = {
  userId: string;
  gameId: string;
};

const COUNT_MAX_OPEN_GAMES_IN_TIME = 1;

@Injectable()
export class X1000BetsService {
  constructor(
    @Inject(AppsNames.Prices) private readonly pricesService: PricesService,
    private readonly prismaService: PrismaService,
    private readonly ledgerService: GameLedgerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly streamingEventsPublisher: StreamingEventsPublisher,
    private readonly configService: ConfigService<Config>
  ) {}

  public async addBet(params: CreateBetParams): Promise<GameX1000> {
    const countOpenedGames = await this.prismaService.betX1000.count({
      where: {
        ownerId: params.userId,
        result: {
          in: [BetResultEnum.INPROGRESS, BetResultEnum.OPEN],
        }
      }
    });

    if (!(countOpenedGames < COUNT_MAX_OPEN_GAMES_IN_TIME)) {
      throw new BadRequestException(`You can't open more then ${COUNT_MAX_OPEN_GAMES_IN_TIME} game`);
    }

    const { maxBetAmount, assetId } = this.configService.get('game');
    const currentAssetPrice = await this.getCurrentPrice();

    const startPrice = Number(currentAssetPrice);

    const { errorMessage, isBetValid } = checkAddX1000BetParams({
      ...params,
      startPrice,
      maxBetAmount,
    });
    if (!isBetValid) {
      throw new BadRequestException(errorMessage);
    }

    const feeAmount = this.getFeeAmount(
      params.amount,
      params.multiplier,
      params.feeType
    );

    const totalAmount = feeAmount.add(params.amount);
    const burnPrice = calculateX1000BetBurnPrice(
      startPrice,
      params.isLong,
      params.multiplier
    );
    const startAt = new Date();

    const {
      createdBet,
      createdGame,
      updatedBalance,
    } = await this.prismaService.$transaction(async (dbTransaction: PrismaTransaction) => {
      const createdGame = await dbTransaction.gameX1000.create({
        data: {
          type: GameTypeEnum.X1000,
          assetId,
          ownerId: params.userId,
          startAt,
          startPrice,
          endPrice: undefined,
          state: GameStateEnum.INPROGRESS,
          data: {},
          pools: {},
        },
      });
      const createdBet = await dbTransaction.betX1000.create({
        data: {
          gameId: createdGame.id,
          gameType: GameTypeEnum.X1000,
          startAt,
          startPrice,
          result: BetResultEnum.INPROGRESS,
          multiplier: params.multiplier,
          takeProfit: params.takeProfit,
          stopLoss: params.stopLoss,
          burnPrice,
          isLong: params.isLong,
          ownerId: params.userId,
          amount: params.amount,
          feeType: params.feeType,
          fee: feeAmount,
          type: BetTypeEnum.PRICE,
        },
      });

      const updatedBalance = await this.ledgerService.createBet(
        params.userId,
        new Decimal(totalAmount),
        createdGame.id,
        createdBet.id,
        GameTypeEnum.X1000,
        dbTransaction
      );

      return {
        updatedBalance,
        createdBet,
        createdGame: { ...createdGame, bets: [createdBet] }
      }
    });

    try {
      await Promise.allSettled([
        this.streamingEventsPublisher.publish(new X1000BetChangedDomainEvent(createdBet)),
        this.domainEventsPublisher.publish(new X1000GameChangedDomainEvent(createdGame)),
        this.domainEventsPublisher.publish(new X1000BetChangedDomainEvent(createdBet)),
        await this.domainEventsPublisher.publish(
          new BalanceUpdatedDomainEvent({
            accountId: updatedBalance.accountId,
            amount: updatedBalance.amount,
            id: updatedBalance.id!,
            createdAt: updatedBalance.createdAt,
          })
        ),
      ])
    } catch {}

    return createdGame;
  }

  public async cashOut(params: CashBetOutParams) {
    const currentAssetPrice = await this.getCurrentPrice();
    const { dbTransactionTimeout } = this.configService.get('app');

    const endAt = new Date();
    const foundBet = await this.prismaService.betX1000.findFirst({
      where: {
        result: BetResultEnum.INPROGRESS,
        gameId: params.gameId,
      },
      include: {
        game: true,
      },
    });
    if (!foundBet) {
      throw new BadRequestException('Bet not found');
    }

    const [game, bet] = await this.prismaService.$transaction<
      [GameX1000, BetX1000]
    >(
      async (dbTransaction: PrismaTransaction) => {
        const [updatedBet, updatedGame] = await Promise.all([
          dbTransaction.betX1000.update({
            where: {
              id: foundBet.id,
            },
            data: {
              result: GameStateEnum.PENDING,
              endPrice: currentAssetPrice,
            },
          }),
          dbTransaction.gameX1000.update({
            where: {
              id: foundBet.gameId,
            },
            data: {
              state: GameStateEnum.PENDING,
              endPrice: currentAssetPrice,
              endAt,
            },
          }),
        ]);
        return [updatedGame, updatedBet];
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: dbTransactionTimeout,
      }
    );

    await this.domainEventsPublisher.publish(new X1000GameChangedDomainEvent(game));

    await Promise.allSettled([this.streamingEventsPublisher.publish(new X1000BetChangedDomainEvent(bet))]);

    return game;
  }

  private getFeeAmount(
    betAmount: number,
    multiplier: number,
    feeType: FeeTypeEnum
  ): Decimal {
    if (feeType === FeeTypeEnum.FLAT_FEE) {
      return new Decimal(betAmount)
        .mul(multiplier)
        .mul(new Decimal(X1000_FLAT_FEE).mul(2));
    }

    return new Decimal(0);
  }

  private async getCurrentPrice() {
    const { assetId } = this.configService.get('game');

    const currentPrice = await lastValueFrom(
      this.pricesService.getAssetCurrentPrice({ assetId })
    );

    return new Decimal(currentPrice.price);
  }
}
