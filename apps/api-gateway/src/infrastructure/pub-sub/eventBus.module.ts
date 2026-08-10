import { Global, Module } from '@nestjs/common';

import { GlobalPubSubService, PubSubService } from './pubSub.service-port';
import { InMemoryPubSubServiceAdapter } from './inMemoryPubSub.service-adapter';
import { RedisPubSubServiceAdapter } from './redisPubSub.service-adapter';

@Module({
  providers: [
    {
      provide: PubSubService,
      useClass: InMemoryPubSubServiceAdapter,
    },
    {
      provide: GlobalPubSubService,
      useClass: RedisPubSubServiceAdapter,
    },
  ],
  exports: [PubSubService, GlobalPubSubService],
})
@Global()
export class EventBusModule {}
