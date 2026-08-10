import { Module } from '@nestjs/common';

import { X1000PricesWorker } from './workers/x1000Prices.worker';
import { X1000PriceListenerController } from './controllers/priceListener.controller';
import { X1000GameObserver } from './controllers/x1000GameState.observer';
import { X1000GameHourlyWorker } from './workers/x1000HourlyComission.worker';
import { X1000GamesResolverWorker } from './cron-jobs/x1000GamesResolver.worker';

@Module({
  imports: [],
  controllers: [X1000PriceListenerController, X1000GameObserver],
  providers: [
    X1000PricesWorker,
    X1000GameHourlyWorker,

    X1000GamesResolverWorker,
  ],
})
export class X1000GameModule {}
