import { Inject } from '@nestjs/common';
import { WalletAddressGaveNftDomainEvent, WalletAddressGaveNftDomainEventPayload } from '@xyro/contracts/analytics';
import { UsersService, getNftLabelByTokenId, getNftValueByTokenId } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';
import { Prisma } from '@prisma/client';
import { NftLedgerService } from '@xyro/libs/ledger';
import { lastValueFrom } from 'rxjs';
import Decimal from 'decimal.js';

import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';

@EventsListener()
export class RemoveBonusForGaveNftBackgroundJob {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    private readonly nftLedgerService: NftLedgerService,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(RemoveBonusForGaveNftBackgroundJob.name);
  }

  @SubscribeDomainEvent(WalletAddressGaveNftDomainEvent)
  async removeBonus(@EventPayload() payload: WalletAddressGaveNftDomainEventPayload) {
    const { tokenId, walletAddress, amount } = payload;

    const user = await lastValueFrom(this.usersService.getUserByAddress({ address: walletAddress })).catch(() => null);

    if (!user) return;

    const NftLabel = getNftLabelByTokenId(tokenId);

    await this.prismaService.$transaction(
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
            },
          });
        }

        if (userNftBonusState[NftLabel] === nftHolder[NftLabel]) return;


        const offset = userNftBonusState[NftLabel] - nftHolder[NftLabel];
        const countBonusesRemove = Math.min(offset, amount);

        await transaction.userNftBonusState.update({
          where: {
            address: walletAddress,
          },
          data: {
            [NftLabel]: {
              decrement: countBonusesRemove,
            },
          }
        });

        for (let i = 0; i < countBonusesRemove; i++) {
          await this.nftLedgerService.removeNftBalance(
            {
              userId: user.id,
              value: new Decimal(getNftValueByTokenId(tokenId)),
              reason: `Reward for ${NftLabel} nft removed`,
            },
            transaction
          );
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    this.logger.log({
      action: 'User removed nft bonus',
      payload: {
        tokenId,
        walletAddress,
      }
    });
  }
}
