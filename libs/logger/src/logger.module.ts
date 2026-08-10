import { config } from 'dotenv';
config();

import { DynamicModule, Global, Module } from '@nestjs/common';
import { PinoLogger, LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ecsFormat } from '@elastic/ecs-pino-format';

import { PinoLoggerService } from './pino-logger.service-adapter';
import { LoggerService } from './logger.service-port';
import { LoggerType } from './loggerType.enum';
import { ConsoleLoggerService } from './console.service-adapter';

const defaultLoggerType: LoggerType = (process.env['LOGGER'] as LoggerType | undefined) ?? LoggerType.pino;

@Module({})
@Global()
export class LoggerModule {
  static forRoot(loggerType?: LoggerType): DynamicModule {
    const imports = [];

    const useLoggerType = loggerType ?? defaultLoggerType;

    if (useLoggerType !== LoggerType.local) {
      imports.push(
        PinoLoggerModule.forRoot({
          pinoHttp: ecsFormat({ convertReqRes: true }),
        })
      );
    }

    return {
      module: LoggerModule,
      imports,
      providers: [
        {
          provide: LoggerService,
          useClass: useLoggerType !== LoggerType.local ? PinoLoggerService : ConsoleLoggerService,
        }
      ],
      exports: [LoggerService],
      global: true,
    }
  }

  static loggerFactory(loggerType?: LoggerType): LoggerService {
    const useLoggerType = loggerType ?? defaultLoggerType;

    if (useLoggerType !== LoggerType.local) {
      return new PinoLoggerService(
        new PinoLogger({
          pinoHttp: ecsFormat({ convertReqRes: true }),
        }),
        { pinoHttp: ecsFormat({ convertReqRes: true }) },
      );
    }
    return new ConsoleLoggerService();
  }
}
