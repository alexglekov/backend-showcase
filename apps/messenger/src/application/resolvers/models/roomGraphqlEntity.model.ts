import { Field, ObjectType } from '@nestjs/graphql';
import { Room } from '@prisma/client';
import { GraphQLEntitiesNames } from '@xyro/core';

@ObjectType('AllowanceSendingMessage')
export class AllowanceSendingMessageGraphQLEntity {
  @Field(() => Boolean)
  isAllowed: boolean;

  @Field(() => String, { nullable: true })
  blockingReason?: string;
}

@ObjectType(GraphQLEntitiesNames.Room)
export class RoomGraphQLEntity {
  @Field(() => String)
  id: string;

  @Field(() => AllowanceSendingMessageGraphQLEntity)
  allowanceSendingMessage: AllowanceSendingMessageGraphQLEntity;

  constructor(entity: Room) {
    this.id = entity.id;
  }
}
