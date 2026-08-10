import { Directive, Field, ObjectType } from '@nestjs/graphql';
import { GraphQLEntitiesNames } from '@xyro/core';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';
import { Message } from '@prisma/client';
import { MessageEntity } from '@xyro/contracts/messenger';

@ObjectType(GraphQLEntitiesNames.Message)
@Directive('@key(fields: "id")')
export class MessageGraphQLEntity extends MessageEntity {
  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  sender?: UserGraphQLOrphanEntity;

  @Field(() => MessageGraphQLEntity, { nullable: true })
  replyTo?: MessageGraphQLEntity;

  fetchedReplyToFromDb?: Message;

  constructor(entity: Message & { replyTo?: Message }) {
    super(entity);

    this.fetchedReplyToFromDb = entity.replyTo;
  }
}
