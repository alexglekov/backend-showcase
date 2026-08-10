import {
  UserCreatedDomainEvent,
  UserCreatedDomainEventPayload,
  UserEntity,
  UserUpdatedDomainEvent,
  UserUpdatedDomainEventPayload,
} from '@xyro/contracts/users';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { RewardsLedgerService } from '@xyro/libs/ledger';
import { LoggerService } from '@xyro/libs/logger';
import { Prisma } from '@prisma/client';

import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';

@EventsListener()
export class AddAirdropBonusBackgroundJob {
  constructor(
    private readonly rewardsLedgerService: RewardsLedgerService,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AddAirdropBonusBackgroundJob.name);
  }

  @SubscribeDomainEvent(UserCreatedDomainEvent)
  async handleUserCreated(@EventPayload() payload: UserCreatedDomainEventPayload) {
    await this.addBonus(payload);
  }

  @SubscribeDomainEvent(UserUpdatedDomainEvent)
  async handleUserUpdated(@EventPayload() payload: UserUpdatedDomainEventPayload) {
    await this.addBonus(payload);
  }

  async addBonus(user: UserEntity) {
    const { id: userId, walletAddress } = user;

    if (!walletAddress) return;

    const userBonusState = await this.prismaService.userBonusState.findFirst({ where: { address: walletAddress } });

    if (!userBonusState) return;

    if (userBonusState.isReceived) return;

    await this.prismaService.$transaction(
      async (transaction: DBTransaction) => {
        await this.rewardsLedgerService.addRewardToUserBalance(
          {
            userId,
            reward: userBonusState.amount,
            reason: `Reward for Airdrop`,
          },
          transaction,
        );

        await transaction.userBonusState.update({
          where: {
            address: walletAddress,
          },
          data: {
            isReceived: true,
          }
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    this.logger.log({
      action: 'User received airdrop bonus',
      payload: {
        userId,
        walletAddress,
        bonusAmount: Number(userBonusState.amount),
      }
    });
  }
}
