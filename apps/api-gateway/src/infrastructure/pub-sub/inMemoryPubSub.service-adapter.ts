import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import {
  AssetPriceChangedPayload,
  PubSubService,
  UpDownGameStatePayload,
  BullsEyeGameStatePayload,
  OneVsOneGameStatePayload,
  MessageStatePayload,
  PaymentOrderStatePayload,
  BalanceUpdatedStatePayload,
  NotificationsPayload,
  SetupGameStatePayload,
  X1000GameStatePayload,
  CreatedSetupGamePayload,
  CreatedOneVsOneGamePayload,
  LuckyBetStreamPayload,
  HighWagerBetStreamPayload,
  HighestPnlBetStreamPayload,
  PublicX1000GamesPayload,
  UserSeasonStatePayload,
  RewardUpdatedStatePayload,
} from './pubSub.service-port';

import { pubSubEventsNames } from './constants';

@Injectable()
export class InMemoryPubSubServiceAdapter extends PubSubService {
  private pubSub: PubSub = new PubSub();

  public publishPublicX1000Game(payload: PublicX1000GamesPayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.x1000.publicGames, payload);
  }
  public publicX1000Games(): AsyncIterator<PublicX1000GamesPayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.x1000.publicGames);
  }

  public async publishUpDownGameState(payload: UpDownGameStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.upDown.state, payload);
  }
  public upDownGameState(): AsyncIterator<UpDownGameStatePayload> {
    return this.pubSub.asyncIterator(pubSubEventsNames.upDown.state);
  }

  public async publishX1000GameState(userId: string, payload: X1000GameStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.x1000.state(userId), payload);
  }
  public x1000GameState(userId: string): AsyncIterator<X1000GameStatePayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.x1000.state(userId));
  }

  public async publishNotification(userId: string, payload: NotificationsPayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.notifications.created(userId), payload);
  }
  public notifications(userId: string): AsyncIterator<NotificationsPayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.notifications.created(userId));
  }

  public async publishPaymentOrderState(userId: string, payload: PaymentOrderStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.payments.orderUpdated(userId), payload);
  }
  public paymentOrdersState(userId: string): AsyncIterator<PaymentOrderStatePayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.payments.orderUpdated(userId));
  }

  public async publishBullsEyeGameState(payload: BullsEyeGameStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.bullsEye.state, payload);
  }
  public bullsEyeGameState(): AsyncIterator<BullsEyeGameStatePayload> {
    return this.pubSub.asyncIterator(pubSubEventsNames.bullsEye.state);
  }

  public publishNewMessageToRoom(roomId: string, payload: MessageStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.rooms.roomMessages(roomId), payload);
  }
  public roomMessages(roomId: string): AsyncIterator<MessageStatePayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.rooms.roomMessages(roomId));
  }

  public async publishOneVsOneGameState(gameId: string, payload: OneVsOneGameStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.oneVsOne.state(gameId), payload);
  }
  public oneVsOneGameState(gameId: string): AsyncIterator<OneVsOneGameStatePayload> {
    return this.pubSub.asyncIterator(pubSubEventsNames.oneVsOne.state(gameId));
  }

  public async publishNewOneVsOneGame(payload: CreatedOneVsOneGamePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.oneVsOne.createdGame, payload);
  }
  public createdOneVsOneGame(): AsyncIterator<CreatedOneVsOneGamePayload> {
    return this.pubSub.asyncIterator(pubSubEventsNames.oneVsOne.createdGame);
  }

  public async publishSetupGameState(gameId: string, payload: SetupGameStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.setup.state(gameId), payload);
  }
  public setupGameState(gameId: string): AsyncIterator<SetupGameStatePayload> {
    return this.pubSub.asyncIterator(pubSubEventsNames.setup.state(gameId));
  }

  public async publishUpdatedBalance(userId: string, payload: BalanceUpdatedStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.common.balanceUpdated(userId), payload);
  }
  public updatedBalance(userId: string): AsyncIterator<BalanceUpdatedStatePayload> {
    return this.pubSub.asyncIterator(pubSubEventsNames.common.balanceUpdated(userId));
  }

  public publishAssetPriceChanged(assetId: string, payload: AssetPriceChangedPayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.prices.assetPriceChanged(assetId), payload);
  }
  public assetPriceChanged(assetId: string): AsyncIterator<AssetPriceChangedPayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.prices.assetPriceChanged(assetId));
  }

  public publishNewSetupGame(payload: CreatedSetupGamePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.setup.createdGames, payload);
  }
  public createdSetupGame(): AsyncIterator<CreatedSetupGamePayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.setup.createdGames);
  }

  public publishLuckyBet(payload: LuckyBetStreamPayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.analytics.luckyBets, payload);
  }
  public luckyBets(): AsyncIterator<LuckyBetStreamPayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.analytics.luckyBets);
  }

  public publishHighWagerBet(payload: HighWagerBetStreamPayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.analytics.highWagerBets, payload);
  }
  public highWagerBets(): AsyncIterator<HighWagerBetStreamPayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.analytics.highWagerBets);
  }

  public publishHighestPnlBet(payload: HighestPnlBetStreamPayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.analytics.highestPnlBets, payload);
  }
  public highestPnlBet(): AsyncIterator<HighestPnlBetStreamPayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.analytics.highestPnlBets);
  }

  public publishUserSeasonState(userId: string, payload: UserSeasonStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.analytics.userSeasonState(userId), payload);
  }
  public userSeasonState(userId: string): AsyncIterator<UserSeasonStatePayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.analytics.userSeasonState(userId));
  }

  public async publishUpdatedReward(userId: string, payload: RewardUpdatedStatePayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.common.rewardUpdated(userId), payload);
  }
  public updatedReward(userId: string): AsyncIterator<RewardUpdatedStatePayload> {
    return this.pubSub.asyncIterator(pubSubEventsNames.common.rewardUpdated(userId));
  }
}
