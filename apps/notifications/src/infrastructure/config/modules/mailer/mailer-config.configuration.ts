import { readFile } from 'fs/promises';

import { MailerConfig } from './mailer-config.type';
import { resolve } from 'path';

export const loadMailerConfig = async (): Promise<MailerConfig> => {
  return {
    mailer: {
      sourceEmail: process.env.MAILER_SOURCE_EMAIL!,
      region: process.env.AWS_SES_MAILER_REGION!,
      accessKeyId: process.env.AWS_SES_MAILER_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SES_MAILER_SECRET_ACCESS_KEY!,

      emailTemplates: {
        recoveryPassword: await readFile(resolve(__dirname, 'templates/recoveryPassword.hbs'), 'utf8'),
      }
    },
  };
};
