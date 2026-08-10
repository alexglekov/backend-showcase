import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotifyTaskCreatedDomainEventPayload, NotifyTaskType } from '@xyro/contracts/notifications';

import { EmailNotificationsService } from '../email-notifications/emailNotifications.service';

@Injectable()
export class InboundNotificationsService {
  constructor(
    private readonly emailNotificationsService: EmailNotificationsService
  ) {}

  async handleEvent(event: NotifyTaskCreatedDomainEventPayload) {
    if (this.isEmailNotification(event.type)) {
      return this.emailNotificationsService.handleEvent(event);
    }

    throw new InternalServerErrorException(`Unexpected notification type ${event.type} with payload ${JSON.stringify(event)}`);
  }

  isEmailNotification(type: NotifyTaskType): boolean {
    return [NotifyTaskType.accountConfirmation, NotifyTaskType.recoveryMessage].includes(type);
  }
}
