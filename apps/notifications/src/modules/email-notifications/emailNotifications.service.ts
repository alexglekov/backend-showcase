import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotifyTaskType, NotifyTaskCreatedDomainEventPayload } from '@xyro/contracts/notifications';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@xyro/libs/mailer';

import { HtmlGeneratorService } from '../../infrastructure/html-generator/htmlGenerator.service';
import { Config } from '../../infrastructure/config';

const PASSWORD_RECOVERY_TITLE = 'XYRO. Password recovery';
const PASSWORD_RECOVERY_PATHNAME = '/password-recovery';
const PASSWORD_RECOVERY_TOKEN_PARAM_NAME = 'token';

@Injectable()
export class EmailNotificationsService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly htmlGenerator: HtmlGeneratorService,
    private readonly configService: ConfigService<Config>,
  ) {}

  async handleEvent(eventPayload: NotifyTaskCreatedDomainEventPayload) {
    const { body, isHtml } = this.getMessage(eventPayload);
    const title = this.getTitle(eventPayload);

    const emailMessage = {
      title: title,
      body,
      to: [eventPayload.payload.email],
    }

    if (isHtml) {
      await this.mailerService.sendHtml(emailMessage);
    } else {
      await this.mailerService.sendText(emailMessage);
    };
  }

  private getMessage(eventPayload: NotifyTaskCreatedDomainEventPayload) {
    const { payload } = eventPayload;
    const { type } = payload;
    const { emailTemplates } = this.configService.get('mailer');
    const { clientUrl } = this.configService.get('app');

    let isHtml = false;
    let body: string;

    if (type === NotifyTaskType.recoveryMessage) {
      isHtml = true;

      const url = new URL(clientUrl);

      url.pathname = PASSWORD_RECOVERY_PATHNAME;
      url.searchParams.append(PASSWORD_RECOVERY_TOKEN_PARAM_NAME, payload.token);

      body = this.htmlGenerator.generateHtmlByTempalte(emailTemplates.recoveryPassword, {
        token: payload.token,
        link: url.toString(),
      });
    } else {
      throw new InternalServerErrorException(`Unexpected email notification type ${type}`);
    }

    return {
      isHtml,
      body,
    }
  }

  private getTitle(eventPayload: NotifyTaskCreatedDomainEventPayload) {
    const { type } = eventPayload;

    if (type === NotifyTaskType.recoveryMessage) return PASSWORD_RECOVERY_TITLE;

    throw new InternalServerErrorException(`Unexpected email notification type ${type}`);
  }
}
