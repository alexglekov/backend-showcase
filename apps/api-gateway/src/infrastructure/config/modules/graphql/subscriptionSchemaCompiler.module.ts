import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppsNames } from '@xyro/core';
import { LoggerModule, LoggerService } from '@xyro/libs/logger';
import { RedisService } from '@xyro/libs/redis';

import { AuthenticationService } from '../../../authentication';
import { OnlineCounterService } from '../../../../modules/online-counter';
import { SubscriptionsModule } from '../../../../modules/subscriptions/subscriptions.module';
import { GlobalPubSubService, PubSubService } from '../../../pub-sub';
import { GraphQLFederationServerManager } from '../../../graphql';
import { SchemaRegistryService } from '../../../third-party';

@Module({
  imports: [
    SubscriptionsModule,
  ],
  providers: [
    {
      provide: AuthenticationService,
      useValue: {},
    },
    {
      provide: ConfigService,
      useValue: {
        get: () => ({}),
      },
    },
    {
      provide: AppsNames.BullsEye,
      useValue: {},
    },
    {
      provide: AppsNames.Users,
      useValue: {},
    },
    {
      provide: AppsNames.Ledger,
      useValue: {},
    },
    {
      provide: GlobalPubSubService,
      useValue: {},
    },
    {
      provide: OnlineCounterService,
      useValue: {},
    },
    {
      provide: PubSubService,
      useValue: {},
    },
    {
      provide: RedisService,
      useValue: {
        initCounter: () => {},
      },
    },
    {
      provide: LoggerService,
      useValue: LoggerModule.loggerFactory(),
    },
    {
      provide: GraphQLFederationServerManager,
      useValue: {},
    },
    {
      provide: SchemaRegistryService,
      useValue: {},
    },
  ],
  exports: [
    AuthenticationService,
    ConfigService,
    AppsNames.Ledger,
    AppsNames.BullsEye,
    AppsNames.Users,
    LoggerService,
    RedisService,
    GlobalPubSubService,
    PubSubService,
    OnlineCounterService,
    GraphQLFederationServerManager,
    SchemaRegistryService,
  ],
})
@Global()
export class SubscriptionSchemaCompileModule {}
