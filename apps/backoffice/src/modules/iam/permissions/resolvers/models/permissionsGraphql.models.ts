import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginatedGraphQLInput, PaginatedGraphQLOutput } from '@xyro/libs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

import { BackofficePermissionGraphQLEntity } from './permissionGraphqlEntity.model';
import { BackofficeGroupPermissionGraphQLEntity } from './groupPermissionGraphqlEntity.model';

@InputType()
export class GetBackofficePermissionsInput extends PaginatedGraphQLInput {}

@ObjectType('BackofficePermissions')
export class BackofficePermissionsGraphQLEntity extends PaginatedGraphQLOutput {
  @Field(() => [BackofficePermissionGraphQLEntity])
  permissions: BackofficePermissionGraphQLEntity[];

  constructor(entity: BackofficePermissionsGraphQLEntity) {
    super();

    this.permissions = entity.permissions;
    this.total = entity.total;
    this.skip = entity.skip;
    this.take = entity.take;
  }
}


@InputType()
export class GetBackofficeGroupPermissionsInput extends PaginatedGraphQLInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  groupId: string;
}

@ObjectType('BackofficeGroupsPermissions')
export class BackofficeGroupPermissionsGraphQLEntity extends PaginatedGraphQLOutput {
  @Field(() => [BackofficeGroupPermissionGraphQLEntity])
  permissions: BackofficeGroupPermissionGraphQLEntity[];

  constructor(entity: BackofficeGroupPermissionsGraphQLEntity) {
    super();

    this.permissions = entity.permissions;
    this.total = entity.total;
    this.skip = entity.skip;
    this.take = entity.take;
  }
}

@InputType()
export class RemovePermissionFromGroupInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  permissionId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

@InputType()
export class AddPermissionToGroupInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  permissionId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}

