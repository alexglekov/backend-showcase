import { Global, Module } from '@nestjs/common';
import { OnlineCounterService } from './onlineCounter.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    OnlineCounterService
  ],
  exports: [
    OnlineCounterService
  ],
})
@Global()
export class OnlineCounterModule {}
