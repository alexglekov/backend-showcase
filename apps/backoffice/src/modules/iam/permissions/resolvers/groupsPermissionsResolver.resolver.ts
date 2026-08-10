import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials, Void } from '@xyro/libs/graphql';

import { PermissionsService } from '../services/permissions.service';
import {
  AddPermissionToGroupInput,
  BackofficeGroupPermissionsGraphQLEntity,
  GetBackofficeGroupPermissionsInput,
  RemovePermissionFromGroupInput
} from './models/permissionsGraphql.models';
import { BackofficeGroupPermissionGraphQLEntity } from './models/groupPermissionGraphqlEntity.model';
import { UsePermissions } from '../decorators/permissions.decorator';
import { PermissionsEnum } from '../core/permissions.enum';

@Resolver()
export class GroupsPermissionsResolver {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Query(() => BackofficeGroupPermissionsGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.groupPermissionsRead,
  ])
  async getGroupPermissions(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('data') payload: GetBackofficeGroupPermissionsInput
  ): Promise<BackofficeGroupPermissionsGraphQLEntity> {
    const { permissions, skip, take, total } = await this.permissionsService.getGroupPermissions({
      groupId: payload.groupId,
      skip: payload.skip,
      take: payload.take,
    })

    return new BackofficeGroupPermissionsGraphQLEntity({
      permissions: permissions.map((permission) => new BackofficeGroupPermissionGraphQLEntity(permission)),
      skip,
      take,
      total,
    });
  }

  @Mutation(() => BackofficeGroupPermissionGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.groupAddPermissions,
  ])
  async addPermissionToGroup(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: AddPermissionToGroupInput,
  ) {
    const { userId } = credentials;

    const createdGroupPermission = await this.permissionsService.addPermissionToGroup({
      blameId: userId,
      groupId: payload.groupId,
      permissionId: payload.permissionId,
    })

    return new BackofficeGroupPermissionGraphQLEntity(createdGroupPermission);
  }

  @Mutation(() => Void)
  @UsePermissions([
    PermissionsEnum.groupRemovePermissions,
  ])
  async removePermissionFromGroup(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') payload: RemovePermissionFromGroupInput,
  ) {
    const { userId } = credentials;

    await this.permissionsService.removePermissionFromGroup({
      blameId: userId,
      groupId: payload.groupId,
      permissionId: payload.permissionId,
    })

    return new Void();
  }
}