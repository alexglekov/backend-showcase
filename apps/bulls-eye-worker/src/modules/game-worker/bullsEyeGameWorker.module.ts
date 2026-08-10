import { Module } from '@nestjs/common';

import { BullsEyeGameWorker } from './bullsEyeGame.worker';
import { BullsEyeDomainEventsListener } from './bullsEyeDomainEventsListener.observer';

@Module({
  imports: [],
  controllers: [
    BullsEyeDomainEventsListener,
  ],
  providers: [
    BullsEyeGameWorker,
  ],
})
export class BullsEyeGameWorkerModule {}
