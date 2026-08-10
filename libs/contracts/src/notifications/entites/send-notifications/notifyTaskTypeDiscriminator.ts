import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum NotifyTaskType {
  recoveryMessage = 'recoveryMessage',
  accountConfirmation = 'accountConfirmation',
}

export class NotifyTaskTypeDiscriminator {
  @IsString()
  @IsEnum(NotifyTaskType)
  @IsNotEmpty()
  public readonly type!: NotifyTaskType;

  constructor(payload?: NotifyTaskTypeDiscriminator) {
    if (!payload) return;

    this.type = payload.type;
  }
}
