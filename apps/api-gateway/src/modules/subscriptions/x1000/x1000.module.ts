import { Module } from '@nestjs/common';

import { X1000GameSubscriptionsResolver } from './x1000.subscriptions';
import { X1000GameStateObserver } from './x1000GameState.observer';

@Module({
  controllers: [
    X1000GameStateObserver,
  ],
  providers: [
    X1000GameSubscriptionsResolver,
  ]
})
export class X1000Module {}