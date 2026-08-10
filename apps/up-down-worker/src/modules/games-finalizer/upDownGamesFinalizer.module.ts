import { Module } from '@nestjs/common';

import { UpDownGamesFinalizerService } from './upDownGamesResolver.service';
import { UpDownDomainEventsListener } from './upDownDomainEventsListener.observer';

@Module({
  imports: [],
  controllers: [
    UpDownDomainEventsListener,
  ],
  providers: [
    UpDownGamesFinalizerService,
  ],
})
export class UpDownGamesFinalizerModule {}
