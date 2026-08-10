import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ConfigService } from '@nestjs/config';

import {
  AssetPriceChangedPayload,
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
  HighWagerBetStreamPayload,
  HighestPnlBetStreamPayload,
  LuckyBetStreamPayload,
  GlobalPubSubService,
  OnlineCountPayload,
  PublicX1000GamesPayload,
} from './pubSub.service-port';
import { Config } from '../config';
import { pubSubEventsNames } from './constants';

@Injectable()
export class RedisPubSubServiceAdapter extends GlobalPubSubService implements OnModuleInit {
  private pubSub: RedisPubSub;

  constructor(private readonly configService: ConfigService<Config>) {
    super()
  }

  onModuleInit() {
    const { host, port } = this.configService.get('redis')

    this.pubSub = new RedisPubSub({
      connection: {
        host,
        port,
      },
    });
  }

  public publishOnlineCount(payload: OnlineCountPayload): Promise<void> {
    return this.pubSub.publish(pubSubEventsNames.common.onlineCount, payload);
  }

  public online(): AsyncIterator<OnlineCountPayload, any, undefined> {
    return this.pubSub.asyncIterator(pubSubEventsNames.common.onlineCount);
  }
}
