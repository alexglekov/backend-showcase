import { Module } from '@nestjs/common';

import { UpDownGameWorker } from './upDownGame.worker';
import { UpDownDomainEventsListener } from './upDownDomainEventsListener.observer';

@Module({
  imports: [],
  controllers: [
    UpDownDomainEventsListener,
  ],
  providers: [
    UpDownGameWorker,
  ],
})
export class UpDownGameWorkerModule {}
