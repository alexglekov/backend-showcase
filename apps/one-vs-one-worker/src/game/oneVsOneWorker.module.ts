import { Module } from '@nestjs/common';

import { OneVsOneGameStateObserver } from './controllers/oneVsOneState.observer';
import { OneVsOneGameWorker } from './workers/oneVsOneGame.worker';
import { OneVsOneGamesFinalizerService } from './oneVsOne.finalizier';
import { OneVsOneCloseWorker } from './cron-jobs/oneVsOneGame.close.cron';

@Module({
  controllers: [OneVsOneGameStateObserver],
  providers: [
    OneVsOneGameWorker,
    OneVsOneGamesFinalizerService,
    OneVsOneCloseWorker,
  ],
})
export class OneVsOneModule {}
