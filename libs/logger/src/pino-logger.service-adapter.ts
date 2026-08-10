import { Inject, Injectable, Scope } from '@nestjs/common';
import { Logger, PARAMS_PROVIDER_TOKEN, Params, PinoLogger } from 'nestjs-pino';

import { LoggerService } from './logger.service-port';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class PinoLoggerService extends Logger implements LoggerService {
  constructor(
    logger: PinoLogger,
    @Inject(PARAMS_PROVIDER_TOKEN) params: Params
  ) {
    super(logger, params);
  }
  
  public setContext(context: string) {
    this.logger.setContext(context);
  }
}
