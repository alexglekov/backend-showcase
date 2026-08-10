import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WalletAddressReceivedNftDomainEvent, WalletAddressReceivedNftDomainEventPayload } from '@xyro/contracts/analytics';
import { UsersService, getNftLabelByTokenId, getNftValueByTokenId } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';
import { LoggerService } from '@xyro/libs/logger';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { NftLedgerService } from '@xyro/libs/ledger';
import { lastValueFrom } from 'rxjs';
import Decimal from 'decimal.js';

import { DBTransaction, PrismaService } from '../../../infrastructure/prisma';

@EventsListener()
export class AddBonusForReceivedNftBackgroundJob {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
    private readonly nftLedgerService: NftLedgerService,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AddBonusForReceivedNftBackgroundJob.name);
  }

  @SubscribeDomainEvent(WalletAddressReceivedNftDomainEvent)
  async addBonus(@EventPayload() payload: WalletAddressReceivedNftDomainEventPayload) {
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

        const offset = nftHolder[NftLabel] - userNftBonusState[NftLabel];
        const countBonusesApply = Math.min(offset, amount);

        await transaction.userNftBonusState.update({
          where: {
            address: walletAddress,
          },
          data: {
            [NftLabel]: {
              increment: countBonusesApply,
            },
          }
        });

        for (let i = 0; i < countBonusesApply; i++) {
          await this.nftLedgerService.addNftBalance(
            {
              userId: user.id,
              value: new Decimal(getNftValueByTokenId(tokenId)),
              reason: `Reward for ${NftLabel} nft added`,
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
      action: 'User received nft bonus',
      payload: {
        tokenId,
        walletAddress,
      }
    });
  }
}
