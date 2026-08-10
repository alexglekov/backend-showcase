import { Controller } from '@nestjs/common';
import {
  HighestPnlBetCreatedDomainEvent,
  HighestPnlBetCreatedDomainEventPayload,
  HighWagerBetCreatedDomainEvent,
  HighWagerBetCreatedDomainEventPayload,
  LuckyBetCreatedDomainEvent,
  LuckyBetCreatedDomainEventPayload,
  RewardUpdatedDomainEvent,
  RewardUpdatedDomainEventPayload,
  UserChallengeTaskUpdatedDomainEvent,
  UserChallengeTaskUpdatedDomainEventPayload
} from '@xyro/contracts/analytics';
import { EventPayload, SubscribeDomainEvent } from '@xyro/libs/events';

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@Controller()
export class AnalyticsObserver {
  constructor(
    private readonly pubSubService: PubSubService,
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
  ) {}

  @SubscribeDomainEvent(LuckyBetCreatedDomainEvent)
  async onLuckyBet(@EventPayload() payload: LuckyBetCreatedDomainEventPayload) {
    const user = await this.graphQLFederationServerManager.getUserById({}, payload.ownerId);

    await this.pubSubService.publishLuckyBet({
      luckyBetsStream: {
        ...payload,
        owner: user,
      } as unknown as any
    });
  }

  @SubscribeDomainEvent(UserChallengeTaskUpdatedDomainEvent)
  async onUserChallengeTaskUpdated(@EventPayload() payload: UserChallengeTaskUpdatedDomainEventPayload) {
    const season = await this.graphQLFederationServerManager.getUserSeasonStateByUserId({}, payload.userId);

    await this.pubSubService.publishUserSeasonState(payload.userId, {
      userSeasonState: season,
    });
  }

  @SubscribeDomainEvent(RewardUpdatedDomainEvent)
  async onRewardUpdatedDomainEvent(@EventPayload() payload: RewardUpdatedDomainEventPayload) {
    await this.pubSubService.publishUpdatedReward(payload.userId, {
      updatedReward: payload,
    });
  }

  @SubscribeDomainEvent(HighestPnlBetCreatedDomainEvent)
  async onHighestPnlBet(@EventPayload() payload: HighestPnlBetCreatedDomainEventPayload) {
    const user = await this.graphQLFederationServerManager.getUserById({}, payload.ownerId);

    await this.pubSubService.publishHighestPnlBet({
      highestPnlBetsStream: {
        ...payload,
        owner: user,
      } as unknown as any,
    });
  }

  @SubscribeDomainEvent(HighWagerBetCreatedDomainEvent)
  async onHighWagerBet(@EventPayload() payload: HighWagerBetCreatedDomainEventPayload) {
    const user = await this.graphQLFederationServerManager.getUserById({}, payload.ownerId);

    await this.pubSubService.publishHighWagerBet({
      highWagerBetsStream: {
        ...payload,
        owner: user,
      } as unknown as any,
    });
  }
}
