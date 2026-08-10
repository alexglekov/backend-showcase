import { Module } from '@nestjs/common';
import { MailerModule, MailerProviders } from '@xyro/libs/mailer';
import { ConfigService } from '@nestjs/config';

import { Config } from '../../infrastructure/config';
import { EmailNotificationsService } from './emailNotifications.service';
import { HtmlGeneratorService } from '../../infrastructure/html-generator/htmlGenerator.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<Config>) => {
        const { accessKeyId, region, secretAccessKey, sourceEmail } = configService.get('mailer');

        return {
          type: MailerProviders.awsSes,
          accessKeyId,
          region,
          secretAccessKey,
          sourceEmail,
        }
      },
      inject: [ConfigService<Config>],
    }),
  ],
  controllers: [],
  providers: [EmailNotificationsService, HtmlGeneratorService],
  exports: [EmailNotificationsService],
})
export class EmailNotificationsModule {}
