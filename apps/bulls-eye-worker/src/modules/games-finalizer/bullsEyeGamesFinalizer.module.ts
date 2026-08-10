import { Module } from '@nestjs/common';

import { BullsEyeGamesFinalizerService } from './bullsEyeGamesResolver.service';
import { BullsEyeDomainEventsListener } from './bullsEyeDomainEventsListener.observer';

@Module({
  imports: [],
  controllers: [
    BullsEyeDomainEventsListener,
  ],
  providers: [
    BullsEyeGamesFinalizerService,
  ],
})
export class BullsEyeGamesFinalizerModule {}
