import {
  UserCreatedDomainEvent,
  UserCreatedDomainEventPayload,
  UserEntity,
  UserUpdatedDomainEvent,
  UserUpdatedDomainEventPayload,
  getAllNftLabels,
  getNftValueByLabel,
} from '@xyro/contracts/users';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { NftLedgerService } from '@xyro/libs/ledger';
import { Prisma } from '@prisma/client';
import Decimal from 'decimal.js';
import { LoggerService } from '@xyro/libs/logger';

import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';

@EventsListener()
export class AddBonusOnUserCreatedOrUpdatedBackgroundJob {
  constructor(
    private readonly nftLedgerService: NftLedgerService,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AddBonusOnUserCreatedOrUpdatedBackgroundJob.name);
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

    const {
      receviedNftBonuses,
      removedNftBonuses,
    } = await this.prismaService.$transaction(
      async (transaction: DBTransaction) => {
        const nftHolder = await transaction.nftHolder.findFirst({ where: { address: walletAddress } });
        if (!nftHolder) return {};

        let userNftBonusState = await transaction.userNftBonusState.findFirst({ where: { address: walletAddress } });

        if (!userNftBonusState) {
          userNftBonusState = await transaction.userNftBonusState.create({
            data: {
              address: walletAddress,
              common: 0,
              epic: 0,
              legendary: 0,
              rare: 0,
            }
          });
        }

        const receviedNftBonuses: string[] = [];
        const removedNftBonuses: string[] = [];

        for (const NftLabel of getAllNftLabels()) {
          const offset = nftHolder[NftLabel] - userNftBonusState[NftLabel];

          for (let i = 0; i < Math.abs(offset); i++) {
            if (offset > 0) {
              receviedNftBonuses.push(NftLabel);
              await this.nftLedgerService.addNftBalance(
                {
                  userId,
                  value: new Decimal(getNftValueByLabel(NftLabel)),
                  reason: `Reward for ${NftLabel} nft added`,
                },
                transaction,
              );
            } else {
              removedNftBonuses.push(NftLabel);
              await this.nftLedgerService.removeNftBalance(
                {
                  userId: user.id,
                  value: new Decimal(getNftValueByLabel(NftLabel)),
                  reason: `Reward for ${NftLabel} nft removed`,
                },
                transaction
              );
            }
          }

          userNftBonusState[NftLabel] += offset;
        }

        await transaction.userNftBonusState.update({
          where: {
            address: walletAddress,
          },
          data: {
            common: userNftBonusState.common,
            epic: userNftBonusState.epic,
            legendary: userNftBonusState.legendary,
            rare: userNftBonusState.rare,
          }
        });

        return {
          receviedNftBonuses,
          removedNftBonuses,
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    if (!receviedNftBonuses && !removedNftBonuses) return;

    this.logger.log({
      action: 'User received nft bonuses after reg or attach wallet',
      payload: {
        receviedNftBonuses,
        removedNftBonuses,
      }
    });
  }
}
