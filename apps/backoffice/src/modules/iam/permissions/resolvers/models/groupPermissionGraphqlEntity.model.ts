import { Field, ObjectType } from '@nestjs/graphql';
import { BackofficeGroupsPermissions } from '@prisma/client';

import { BackofficeUserGraphQLEntity } from '../../../users/models/userGraphqlEntity.model';
import { BackofficeGroupGraphQLEntity } from '../../../groups/models/groupGraphqlEntity.model';
import { BackofficePermissionGraphQLEntity } from './permissionGraphqlEntity.model';

@ObjectType('BackofficeGroupPermission')
export class BackofficeGroupPermissionGraphQLEntity {
  @Field()
  id: string;

  @Field(() => String, { nullable: true })
  blameId: string | null;

  @Field()
  permissionId: string;

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

  @Field(() => BackofficePermissionGraphQLEntity)
  permission: BackofficePermissionGraphQLEntity;

  @Field(() => BackofficeGroupGraphQLEntity)
  group: BackofficeGroupGraphQLEntity;

  constructor(entity: BackofficeGroupsPermissions) {
    this.id = entity.id;
    this.blameId = entity.blameId;
    this.groupId = entity.groupId;
    this.permissionId = entity.permissionId;
    this.deleted = entity.deleted;
    this.deletedAt = entity.deletedAt;
    this.assignedAt = entity.assignedAt;
  }
}