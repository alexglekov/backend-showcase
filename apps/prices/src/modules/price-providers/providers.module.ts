import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { PricesReaderModule } from '../reader/reader.module';
import { PidModule } from './modules/pid/pid.module';

import { PriceCollectorService } from './priceCollector.service';
import { BinanceProviderService } from './providers/binanceProvider.service';
import { OkxProvider } from './providers/okxProvider.service';
import { HuobiProvider } from './providers/huobiProvider.service';
import { KrakenProvider } from './providers/krakenProvider.service';
import { ByBitProvider } from './providers/bybitProvider.service';
import { KuCoinProvider } from './providers/kuCoinProvider.service';
import { BitGetProvider } from './providers/bitGetProvider.service';

@Module({
  imports: [HttpModule, PricesReaderModule, PidModule],
  providers: [
    PriceCollectorService,

    BinanceProviderService,
    OkxProvider,
    HuobiProvider,
    ByBitProvider,
    KuCoinProvider,
    BitGetProvider,

    KrakenProvider,
  ],
  exports: [PriceCollectorService],
})
export class PriceProvidersModule {}
