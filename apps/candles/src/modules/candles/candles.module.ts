import { Module } from '@nestjs/common';

import { Candle5sService } from './cron-jobs/s5.candle.service';
import { CandleListenerController } from './candle.controller';
import { CandleService } from './candle.service';
import { CandlesResolver } from './candle.resolver';

@Module({
  controllers: [CandleListenerController],
  providers: [Candle5sService, CandleService, CandlesResolver],
})
export class CandlesModule {}
