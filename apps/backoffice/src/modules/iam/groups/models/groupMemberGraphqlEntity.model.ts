import { Field, ObjectType } from '@nestjs/graphql';
import { UsersOnGroups } from '@prisma/client';

import { BackofficeUserGraphQLEntity } from '../../users/models/userGraphqlEntity.model';
import { BackofficeGroupGraphQLEntity } from './groupGraphqlEntity.model';

@ObjectType('BackofficeGroupMember')
export class BackofficeGroupMemberGraphQLEntity {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  blameId: string | null;

  @Field()
  userId: string;

  @Field()
  groupId: string;

  @Field(() => Boolean)
  deleted: Boolean;

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;

  @Field(() => Date)
  assignedAt: Date;

  @Field(() => BackofficeUserGraphQLEntity, { nullable: true })
  blame: BackofficeUserGraphQLEntity;

  @Field(() => BackofficeUserGraphQLEntity)
  user: BackofficeUserGraphQLEntity;

  @Field(() => BackofficeGroupGraphQLEntity)
  group: BackofficeGroupGraphQLEntity;

  constructor(entity: UsersOnGroups) {
    this.id = entity.id;
    this.blameId = entity.blameId;
    this.groupId = entity.groupId;
    this.userId = entity.userId;
    this.deleted = entity.deleted;
    this.deletedAt = entity.deletedAt;
    this.assignedAt = entity.assignedAt;
  }
}