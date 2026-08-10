import { Inject, Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { MAILER_MODULE_CONFIG_TOKEN } from './tokens';
import { MailerService } from './mailer.service-port';
import { SendEmailParams } from './interfaces/mailer.interface';
import { SesMailerProviderOptions } from './interfaces/mailer.options';

@Injectable()
export class SesMailerServiceAdapter extends MailerService {
  private sesClient: SESClient;

  private sourceEmail: string;

  constructor(
    @Inject(MAILER_MODULE_CONFIG_TOKEN) options: SesMailerProviderOptions,
  ) {
    super();

    const { region, accessKeyId, secretAccessKey, sourceEmail } = options;

    this.sesClient = new SESClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.sourceEmail = sourceEmail;
  }

  async sendText(params: SendEmailParams): Promise<void> {
    const { to, title, body } = params;

    const command = new SendEmailCommand({
      Source: this.sourceEmail,
      Destination: {
        ToAddresses: to,
      },
      Message: {
        Subject: {
          Data: title,
        },
        Body: {
          Text: {
            Data: body,
          },
        },
      },
    });

    await this.sesClient.send(command);
  }

  async sendHtml(params: SendEmailParams): Promise<void> {
    const { to, title, body } = params;

    const command = new SendEmailCommand({
      Source: this.sourceEmail,
      Destination: {
        ToAddresses: to,
      },
      Message: {
        Subject: {
          Data: title,
        },
        Body: {
          Html: {
            Data: body,
          }
        },
      },
    });

    await this.sesClient.send(command);
  }

}
