import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { NotifyTaskType, NotifyTaskTypeDiscriminator } from './notifyTaskTypeDiscriminator';

export class RecoveryPasswordEmailNotificationPayload extends NotifyTaskTypeDiscriminator {
  @IsString()
  @IsEnum(NotifyTaskType)
  @IsNotEmpty()
  public override readonly type!: NotifyTaskType.recoveryMessage;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public readonly email!: string;

  @IsString()
  @IsNotEmpty()
  public readonly token!: string;

  constructor(payload?: RecoveryPasswordEmailNotificationPayload) {
    super(payload);

    if (!payload) return;

    this.email = payload.email;
    this.type = payload.type;
    this.token = payload.token;
  }
}