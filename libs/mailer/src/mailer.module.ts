import { DynamicModule, Global, InternalServerErrorException, Module, Provider } from '@nestjs/common';

import { MailerService } from './mailer.service-port';
import { MAILER_MODULE_CONFIG_TOKEN } from './tokens';
import {
  MailerModuleAsyncOptions,
  MailerModuleOptions,
  MailerProviders
} from './interfaces/mailer.options';
import { SesMailerServiceAdapter } from './mailer.service-adapter';

@Module({})
@Global()
export class MailerModule {
  public static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: MAILER_MODULE_CONFIG_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject,
      },
      {
        provide: MailerService,
        useFactory: (options: MailerModuleOptions): MailerService => {
          if (options.type === MailerProviders.awsSes) {
            return new SesMailerServiceAdapter(options)
          }
      
          throw new InternalServerErrorException(`Unexpected mailer provider type ${options.type}`);
        },
        inject: [MAILER_MODULE_CONFIG_TOKEN],
      },
    ];

    return {
      module: MailerModule,
      imports: options.imports,
      providers: providers,
      exports: [MailerService],
    };
  }
}
