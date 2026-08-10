import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { TwitterAccountGraphQLOrphanEntity } from '@xyro/contracts/twitter';

import { TwitterAccountGraphQLEntity } from './twitterAccountGraphQLEntity';
import { TwitterUsersService } from './twitterUsers.service';

@Injectable()
export class TwitterUsersDataLoader {
  private readonly dataLoader: DataLoader<TwitterAccountGraphQLOrphanEntity, TwitterAccountGraphQLEntity | null>;

  constructor(
    private readonly twitterService: TwitterUsersService,
  ) {
    this.dataLoader = new DataLoader(
      async (references: TwitterAccountGraphQLOrphanEntity[]) => {
        const resolvedAccounts = await this.twitterService.getManyByIds(references.map((reference) => reference.id));

        const sortedInIdsOrder = references.map((ref) => {
          const twitterAccount = resolvedAccounts.find(
            (user) => user?.id === ref.id,
          );

          return twitterAccount ? new TwitterAccountGraphQLEntity(twitterAccount) : null;
        });

        return sortedInIdsOrder;
      },
    );
  }

  async getAccountByReference(reference: TwitterAccountGraphQLOrphanEntity): Promise<TwitterAccountGraphQLEntity | null> {
    const twitterAccount = await this.twitterService.getById(reference.id);

    return twitterAccount ? new TwitterAccountGraphQLEntity(twitterAccount) : null;
  }
}
