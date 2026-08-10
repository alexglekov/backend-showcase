import { Global, Module } from '@nestjs/common';

import { PubSubService } from './pubSub.service-port';
import { InMemoryPubSubServiceAdapter } from './inMemoryPubSub.service-adapter';

@Module({
  providers: [
    {
      provide: PubSubService,
      useClass: InMemoryPubSubServiceAdapter,
    },
  ],
  exports: [PubSubService],
})
@Global()
export class EventBusModule {}
