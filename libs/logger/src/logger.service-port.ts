import type { LoggerService as BaseLoggerService } from '@nestjs/common';

export abstract class LoggerService implements BaseLoggerService {
  abstract verbose(message: any, ...optionalParams: any[]): void;
  abstract debug(message: any, ...optionalParams: any[]): void;
  abstract log(message: any, ...optionalParams: any[]): void;
  abstract warn(message: any, ...optionalParams: any[]): void;
  abstract error(message: any, ...optionalParams: any[]): void;
  abstract fatal(message: any, ...optionalParams: any[]): void;
  abstract setContext(context: string): void;
}
