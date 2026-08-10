import { SendEmailParams } from './interfaces/mailer.interface';

export abstract class MailerService {
  public abstract sendHtml(
    params: SendEmailParams,
  ): Promise<void>;
  public abstract sendText(
    params: SendEmailParams,
  ): Promise<void>;
}
