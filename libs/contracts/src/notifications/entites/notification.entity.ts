import { Field, ObjectType } from '@nestjs/graphql';
import { NotificationType, Notifications } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class NotificationEntity<T = any> {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly id!: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(NotificationType)
  @Field(() => NotificationType)
  public readonly type!: NotificationType;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @Field(() => Date)
  public readonly createdAt!: Date;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly userId!: string;

  public readonly body!: T;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @Field(() => Date)
  public readonly updatedAt!: Date;

  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean)
  public readonly isRead!: boolean;

  constructor(notification?: Notifications) {
    if (!notification) return;

    this.id = notification.id;
    this.type = notification.type;
    this.userId = notification.userId;
    this.body = notification.body as T;
    this.createdAt = new Date(notification.createdAt);
    this.updatedAt = new Date(notification.updatedAt);
    this.isRead = notification.isRead;
  }
}
