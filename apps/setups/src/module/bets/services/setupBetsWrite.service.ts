import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaErrorTypesEnum, PrismaTransaction } from '@xyro/libs/utils';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { GameLedgerService } from '@xyro/libs/ledger';
import { BetResultEnum, BetSetup, BetTypeEnum, GameStateEnum, GameTypeEnum } from '@prisma/client';
import { SetupBetChangedDomainEvent } from '@xyro/contracts/setups';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import Decimal from 'decimal.js';

import { PrismaService } from '../../../infrastructure/prisma';

type AddSetupBetParams = {
  gameId: string;
  takeProfit: boolean;
  amount: number;
  userId: string;
};

@Injectable()
export class SetupBetsWriteService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly ledgerService: GameLedgerService,
  ) {}

  public async addBet(params: AddSetupBetParams): Promise<BetSetup> {
    const game = await this.prismaService.gameSetup.findFirst({
      where: {
        id: params.gameId,
      },
      include: {
        bets: true,
      }
    });

    if (!game) {
      throw new BadRequestException('Setup game not found.');
    }

    if (game.state !== GameStateEnum.OPEN) {
      throw new BadRequestException('Setup game has already started.');
    }

    if (!game.stopBetsAt || game.stopBetsAt < new Date()) {
      throw new BadRequestException('Setup game has already started.');
    }

    try {
      const {
        bet,
        updatedBalance,
      } = await this.prismaService.$transaction(async (dbTransaction: PrismaTransaction) => {
        const [bet] = await Promise.all([
          dbTransaction.betSetup.create({
            data: {
              gameType: GameTypeEnum.SETUP,
              gameId: params.gameId,
              ownerId: params.userId,
              isUp: params.takeProfit,
              type: BetTypeEnum.UPDOWN,
              amount: params.amount,
              result: BetResultEnum.OPEN,
            },
          }),
          game.ownerId === params.userId
            ? dbTransaction.gameSetup.update({
                where: { id: game.id },
                data: {
                  isTrusted: true,
                },
                include: {
                  bets: true,
                }
              })
            : Promise.resolve(undefined),
        ]);

        const updatedBalance = await this.ledgerService.createBet(
          params.userId,
          new Decimal(params.amount),
          params.gameId,
          bet.id,
          GameTypeEnum.SETUP,
          dbTransaction
        );

        return {
          bet,
          updatedBalance,
        };
      });

      await Promise.allSettled([
        this.domainEventsPublisher.publish(
          new BalanceUpdatedDomainEvent({
            accountId: updatedBalance.accountId,
            amount: updatedBalance.amount,
            id: updatedBalance.id!,
            createdAt: updatedBalance.createdAt,
          })
        ),
        this.domainEventsPublisher.publish(new SetupBetChangedDomainEvent(bet)),
      ]);

      return bet;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      if (error.name === PrismaClientKnownRequestError.name) {
        if (error.code === PrismaErrorTypesEnum.UniqueConstraintFailed) throw new BadRequestException('You are already in the game.')
      }

      throw new InternalServerErrorException(error);
    }
  }
}
