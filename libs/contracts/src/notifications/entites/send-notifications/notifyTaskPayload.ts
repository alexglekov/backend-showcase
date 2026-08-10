import { Type, plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { RecoveryPasswordEmailNotificationPayload } from './recoveryPasswordEmailNotificationPayload';
import { NotifyTaskType, NotifyTaskTypeDiscriminator } from './notifyTaskTypeDiscriminator';
import { AccountConfirmationEmailNotificationPayload } from './accountConfirmationEmailNotificationPayload';

interface TNotifyTaskPayload extends Record<NotifyTaskType, unknown> {
  [NotifyTaskType.recoveryMessage]: RecoveryPasswordEmailNotificationPayload;
  [NotifyTaskType.accountConfirmation]: AccountConfirmationEmailNotificationPayload;
}

export class NotifyTaskPayload<NT extends NotifyTaskType> {
  @IsString()
  @IsEnum(NotifyTaskType)
  @IsNotEmpty()
  public readonly type!: NT;

  @ValidateNested()
  @Type(() => NotifyTaskTypeDiscriminator, {
    discriminator: {
      property: 'type',
      subTypes: [
        { value: RecoveryPasswordEmailNotificationPayload, name: NotifyTaskType.recoveryMessage },
        { value: AccountConfirmationEmailNotificationPayload, name: NotifyTaskType.accountConfirmation },
      ]
    },
    keepDiscriminatorProperty: true,
  })
  public readonly payload!: TNotifyTaskPayload[NT];

  constructor(payload?: NotifyTaskPayload<NT>) {
    if (!payload) return;

    this.type = payload.type;
    this.payload = plainToInstance(NotifyTaskPayload<NT>, payload).payload;
  }
}
