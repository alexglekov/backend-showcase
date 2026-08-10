import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { PaymentController } from './payment.controller';
import { PaymentResolver } from './resolvers/payment.resolver';
import { CoinsPaidPaymentProvider } from './services/coins-paid';
import { PaymentService } from './services/payment.service';
import { Config } from '../../infrastructure/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory(configService: ConfigService<Config>) {
        const { coinsPaidBaseUrl } = configService.get('wallet')

        return {
          baseURL: coinsPaidBaseUrl,
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [CoinsPaidPaymentProvider, PaymentService, PaymentResolver],
  exports: [],
})
export class PaymentModule {}
