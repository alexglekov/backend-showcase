import { Module } from '@nestjs/common';

import { AirdropsController } from './airdropsCallbacks.controller';

@Module({
  controllers: [
    AirdropsController
  ]
})
export class AirdropsModule {}