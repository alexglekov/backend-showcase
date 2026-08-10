import { Field, ObjectType } from '@nestjs/graphql';
import { NotificationType, Notifications } from '@prisma/client';

@ObjectType({ isAbstract: true })
export class BaseNotificationGraphqlEntity {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  isRead: boolean;

  @Field(() => Date)
  createdAt: Date;

  constructor(entity: Notifications) {
    this.id = entity.id;
    this.userId = entity.userId;
    this.type = entity.type;
    this.isRead = entity.isRead;
    this.createdAt = entity.createdAt;
  }
}