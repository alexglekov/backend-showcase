import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from '@xyro/libs/logger';

import { SchedulerService } from './scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), LoggerModule.forRoot()],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
@Global()
export class SchedulerModule {}
