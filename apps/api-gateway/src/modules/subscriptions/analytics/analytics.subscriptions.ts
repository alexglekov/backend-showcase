import { Resolver, Subscription } from '@nestjs/graphql';
import { BetGraphQLOrphanEntity, RewardGraphQLOrphanEntity, SeasonGraphQLOrphanEntity } from '@xyro/contracts/analytics';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import {
  HighWagerBetStreamPayload,
  HighestPnlBetStreamPayload,
  LuckyBetStreamPayload,
  PubSubService,
  RewardUpdatedStatePayload,
  UserSeasonStatePayload
} from '../../../infrastructure/pub-sub';

@Resolver()
export class AnalyticsSubscriptionsResolver {
  constructor(private readonly pubSubService: PubSubService) {}

  @Subscription(() => SeasonGraphQLOrphanEntity)
  userSeasonState(
    @UserCredentials() credentials: IUserCredentials,
  ): AsyncIterator<UserSeasonStatePayload> {
    const { userId } = credentials;

    return this.pubSubService.userSeasonState(userId);
  }

  @Subscription(() => RewardGraphQLOrphanEntity)
  updatedReward(
    @UserCredentials() credentials: IUserCredentials,
  ): AsyncIterator<RewardUpdatedStatePayload> {
    const { userId } = credentials;

    return this.pubSubService.updatedReward(userId);
  }

  @Subscription(() => BetGraphQLOrphanEntity)
  luckyBetsStream(): AsyncIterator<LuckyBetStreamPayload> {
    return this.pubSubService.luckyBets();
  }

  @Subscription(() => BetGraphQLOrphanEntity)
  highWagerBetsStream(): AsyncIterator<HighWagerBetStreamPayload> {
    return this.pubSubService.highWagerBets();
  }

  @Subscription(() => BetGraphQLOrphanEntity)
  highestPnlBetsStream(): AsyncIterator<HighestPnlBetStreamPayload> {
    return this.pubSubService.highestPnlBet();
  }
}