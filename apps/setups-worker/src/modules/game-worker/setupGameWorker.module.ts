import { Module } from '@nestjs/common';

import { SetupGameWorker } from './setupGame.worker';
import { SetupWorkerObserver } from './setupWorker.observer';

@Module({
  imports: [],
  controllers: [
    SetupWorkerObserver,
  ],
  providers: [
    SetupGameWorker,
  ],
})
export class SetupGameWorkerModule {}
