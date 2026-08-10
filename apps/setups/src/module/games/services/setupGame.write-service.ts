import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  GameStateEnum,
  GameTypeEnum,
} from '@prisma/client';
import { DateTime } from 'luxon';
import { lastValueFrom } from 'rxjs';
import { LoggerService } from '@xyro/libs/logger';
import { Decimal } from 'decimal.js';
import { PrismaTransaction } from '@xyro/libs/utils';
import { AppsNames } from '@xyro/core';
import { PricesService } from '@xyro/contracts/prices';
import { UsersService } from '@xyro/contracts/users';
import { GameLedgerService } from '@xyro/libs/ledger';
import { SetupGameChangedDomainEvent } from '@xyro/contracts/setups';
import { DomainEventsPublisher } from '@xyro/libs/events';

import { PrismaService } from '../../../infrastructure/prisma';
import { TSetupGameWithPoolsEnfo } from './typings';

type CreateGameParams = {
  ownerId: string;
  assetId: string;
  timeframe: number;
  isLong: boolean;
  takeProfit: number;
  stopLoss: number;
};

const COUNT_MAX_OPEN_GAMES_IN_TIME = 1;

@Injectable()
export class SetupGameWriteService {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    @Inject(AppsNames.Prices) private readonly pricesService: PricesService,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
    private readonly ledgerService: GameLedgerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
  ) {
    this.logger.setContext(SetupGameWriteService.name);
  }

  private validateCreateGameInput(
    params: CreateGameParams,
    currentAssetPrice: number
  ) {
    const { isLong, takeProfit, stopLoss } = params;

    if (isLong) {
      if (takeProfit <= currentAssetPrice) {
        throw new BadRequestException(
          `Invalid take profit, must be more then ${currentAssetPrice}.`
        );
      }
      if (stopLoss >= currentAssetPrice) {
        throw new BadRequestException(
          `Invalid stop loss, must be less then ${currentAssetPrice}.`
        );
      }
    } else {
      if (takeProfit >= currentAssetPrice) {
        throw new BadRequestException(
          `Invalid take profit, must be less then ${currentAssetPrice}.`
        );
      }
      if (stopLoss <= currentAssetPrice) {
        throw new BadRequestException(
          `Invalid stop loss, must be more then ${currentAssetPrice}.`
        );
      }
    }
  }

  public async createGame(params: CreateGameParams): Promise<TSetupGameWithPoolsEnfo> {
    const countOpenedGames = await this.prismaService.gameSetup.count({
      where: {
        ownerId: params.ownerId,
        state: {
          in: [GameStateEnum.INPROGRESS, GameStateEnum.OPEN],
        }
      }
    });

    if (!(countOpenedGames < COUNT_MAX_OPEN_GAMES_IN_TIME)) {
      throw new BadRequestException(`You can't open more then ${COUNT_MAX_OPEN_GAMES_IN_TIME} game.`);
    }

    // Now everyone can create setup, not only influencer
    // const user = await lastValueFrom(this.usersService.getUserById({ userId: params.ownerId }));

    // if (!user.isInfluencer) {
    // throw new BadRequestException(`Setup game can only be created by a influencer.`)
    // }

    const currentAssetPrice = await this.getCurrentPrice(params.assetId);

    if (!currentAssetPrice) {
      throw new InternalServerErrorException(
        'The start price for your game was not found.'
      );
    }

    this.validateCreateGameInput(params, Number(currentAssetPrice));

    const startAt = DateTime.fromJSDate(new Date());
    const endAt = startAt.plus({ millisecond: params.timeframe * 1000 });
    const stopBetsAt = startAt.plus({
      millisecond: (params.timeframe / 3) * 1000,
    });

    const { game: createdGame } = await this.prismaService.$transaction(
      async (dbTransaction: PrismaTransaction) => {
        const game = await dbTransaction.gameSetup.create({
          data: {
            type: GameTypeEnum.SETUP,
            assetId: params.assetId,
            startPrice: currentAssetPrice,
            timeframe: params.timeframe,
            state: GameStateEnum.OPEN,
            pools: {},
            meta: {},
            data: {},
            isLong: params.isLong,
            isTrusted: false,
            stopLoss: params.stopLoss,
            takeProfit: params.takeProfit,
            ownerId: params.ownerId,
            startAt: startAt.toJSDate(),
            endAt: endAt.toJSDate(),
            stopBetsAt: stopBetsAt.toJSDate(),
          },
          include: {
            bets: true,
          }
        });
        await this.ledgerService.createGameAccount(game.id, dbTransaction);
        return {
          game,
        };
      }
    );

    await this.domainEventsPublisher.publish(new SetupGameChangedDomainEvent(createdGame));

    this.logger.log({
      action: `Setup Game created`,
      payload: {
        gameId: createdGame.id,
      }
    });

    return {
      ...createdGame,
      takeProfitPool: {
        amount: 0,
        count: 0,
        multiplier: 0,
      },
      stopLossPool: {
        amount: 0,
        count: 0,
        multiplier: 0,
      }
    };
  }

  private async getCurrentPrice(assetId: string) {
    try {
      const currentPrice = await lastValueFrom(this.pricesService.getAssetCurrentPrice({ assetId }));
      return new Decimal(currentPrice.price);
    } catch(error) {
      this.logger.error({
        action: 'Error occured during getting current asset',
        payload: {
          assetId,
          currentTimestamp: Date.now(),
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      return null;
    }
  }
}
