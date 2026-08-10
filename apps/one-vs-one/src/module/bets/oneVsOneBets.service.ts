import { BadRequestException, Injectable } from '@nestjs/common';
import { GameLedgerService } from '@xyro/libs/ledger';
import {
  Bet1vs1,
  BetResultEnum,
  BetTypeEnum,
  DirectionEnum,
  Game1vs1,
  GameStateEnum,
  GameTypeEnum,
} from '@prisma/client';
import { Decimal } from 'decimal.js';
import { LoggerService } from '@xyro/libs/logger';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import { OneVsOneBetChangedDomainEvent, OneVsOneGameChangedDomainEvent } from '@xyro/contracts/one-vs-one';

import { DBTransaction, PrismaService } from '../../infrastructure/prisma';

type AddOneVsOneBetParams = {
  userId: string;
  gameId: string;
  price?: number;
};

@Injectable()
export class OneVsOneBetsService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly ledgerService: GameLedgerService,
    private readonly domainEventsPublisher: DomainEventsPublisher
  ) {
    this.logger.setContext(OneVsOneBetsService.name);
  }

  public async addBet(params: AddOneVsOneBetParams): Promise<Bet1vs1> {
    const foundGame = await this.prismaService.game1vs1.findFirst({
      where: {
        id: params.gameId,
      },
      include: {
        bets: true,
      },
    });

    if (!foundGame) {
      throw new BadRequestException('Game not found');
    }

    this.validateGame(foundGame, params);

    const {
      createdBet,
      updatedBalance,
      updatedGame
    } = await this.prismaService.$transaction(
      async (dbTransaction: DBTransaction) => {
        const [ownerBet] = foundGame.bets;

        const [updatedGame, createdBet] = await Promise.all([
          dbTransaction.game1vs1.update({
            where: {
              id: foundGame.id,
            },
            data: {
              opponentId: params.userId,
              state: GameStateEnum.INPROGRESS,
            },
          }),
          dbTransaction.bet1vs1.create({
            data: {
              gameType: GameTypeEnum.ONEVSONE,
              gameId: foundGame.id,
              ownerId: params.userId,
              type: foundGame.isExact ? BetTypeEnum.PRICE : BetTypeEnum.UPDOWN,
              amount: ownerBet.amount,
              price: params.price || undefined,
              result: BetResultEnum.OPEN,
              isUp: foundGame.isExact
                ? undefined
                : foundGame.direction !== DirectionEnum.UP,
            },
          }),
        ]);

        const updatedBalance = await this.ledgerService.createBet(
          params.userId,
          new Decimal(ownerBet.amount),
          foundGame.id,
          createdBet.id,
          GameTypeEnum.ONEVSONE,
          dbTransaction
        );

        return {
          updatedGame,
          createdBet,
          updatedBalance,
        };
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
        this.domainEventsPublisher.publish(new OneVsOneGameChangedDomainEvent(updatedGame)),
        this.domainEventsPublisher.publish(new OneVsOneBetChangedDomainEvent(createdBet)),
      ])
    } catch {}

    this.logger.log({
      action: 'Accept Game',
      payload: {
        gameId: params.gameId,
        userId: params.userId,
      },
    });

    return createdBet;
  }

  private validateGame(
    game: Game1vs1 & { bets: Bet1vs1[] },
    params: AddOneVsOneBetParams
  ) {
    if (game.bets.length > 1) {
      throw new BadRequestException('1vs1 game already has enough participants.');
    }

    if (game.state !== GameStateEnum.OPEN || game.stopBetsAt! < new Date()) {
      throw new BadRequestException('1vs1 game has already started.');
    }

    if (game.isExact && !params.price) {
      throw new BadRequestException('You entered an incorrect price.');
    }

    if (params.userId === game.ownerId) {
      throw new BadRequestException('You can’t accept your own game.');
    }

    if (game.opponentId && params.userId !== game.opponentId) {
      throw new BadRequestException('You are not an opponent of the game.');
    }
  }
}
