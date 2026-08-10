import { Global, Module } from '@nestjs/common';

import { AlertManager } from './alertManager.service-port';
import { TelegramAlertManagerAdapter } from './telegramAlertManager.service-adapter';

@Global()
@Module({
  providers: [
    {
      provide: AlertManager,
      useClass: TelegramAlertManagerAdapter,
    }
  ],
  exports: [
    AlertManager
  ],
})
export class AlertManagerModule {}