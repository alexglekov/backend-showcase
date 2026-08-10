import { Module } from '@nestjs/common';

import { CoinsPaidCallbacksController } from './coinsPaidCallbacks.controller';

@Module({
  controllers: [CoinsPaidCallbacksController]
})
export class CoinsPaidModule {}