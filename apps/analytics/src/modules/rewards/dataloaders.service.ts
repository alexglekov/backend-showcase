import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { RewardGraphQLOrphanEntity } from '@xyro/contracts/analytics';

import { RewardsService } from './rewards.service';

@Injectable()
export class RewardsDataLoader {
  private readonly lastPlaceOnLeaderboardDataLoader: DataLoader<RewardGraphQLOrphanEntity, number>;

  constructor(
    private readonly rewardsService: RewardsService,
  ) {
    this.lastPlaceOnLeaderboardDataLoader = new DataLoader(
      async (references: RewardGraphQLOrphanEntity[]) => {
        const lastPlaceOnLeaderboard = await this.rewardsService.getLastPlaceOnLeaderboard();
        return references.map(() => lastPlaceOnLeaderboard);
      },
    );
  }

  async getLastPlaceOnLeaderboard(reference: RewardGraphQLOrphanEntity): Promise<number> {
    return this.lastPlaceOnLeaderboardDataLoader.load(reference);
  }
}
