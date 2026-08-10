import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { NotifyTaskType, NotifyTaskTypeDiscriminator } from './notifyTaskTypeDiscriminator';

export class AccountConfirmationEmailNotificationPayload extends NotifyTaskTypeDiscriminator {
  @IsString()
  @IsEnum(NotifyTaskType)
  @IsNotEmpty()
  public override readonly type!: NotifyTaskType.accountConfirmation;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public readonly email!: string;

  @IsString()
  @IsNotEmpty()
  public readonly code!: string;

  constructor(payload?: AccountConfirmationEmailNotificationPayload) {
    super(payload);

    if (!payload) return;

    this.email = payload.email;
    this.type = payload.type;
    this.code = payload.code;
  }
}