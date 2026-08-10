import { Module } from '@nestjs/common';

import { PriceProvidersModule } from '../price-providers/providers.module';
import { PricesReaderModule } from '../reader/reader.module';

import { PricesWriterService } from './writer.service';
import { PriceTickService } from './cron-jobs/priceTick.service';
import { Last7DaysService } from './cron-jobs/last7days.service';

@Module({
  imports: [PriceProvidersModule, PricesReaderModule],
  providers: [PricesWriterService, PriceTickService, Last7DaysService],
})
export class PricesWriterModule {}
