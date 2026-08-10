import { Global, Module } from '@nestjs/common';

import { DataLoaderService } from './dataloaders.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    DataLoaderService
  ],
  exports: [
    DataLoaderService
  ],
})
export class DataLoaderModule {}
