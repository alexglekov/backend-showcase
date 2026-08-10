import { Module } from '@nestjs/common';
import { PidService } from './pid.service';
import { AssetPriceDomainEventsListener } from './assetPriceDomainEventsListener';
import { PricesReaderModule } from '../../../reader/reader.module';

@Module({
  imports: [PricesReaderModule],
  controllers: [AssetPriceDomainEventsListener],
  providers: [PidService],
  exports: [],
})
export class PidModule {}
