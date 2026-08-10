import { Args, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { PermissionsService } from '../services/permissions.service';
import { GetBackofficePermissionsInput, BackofficePermissionsGraphQLEntity } from './models/permissionsGraphql.models';
import { BackofficePermissionGraphQLEntity } from './models/permissionGraphqlEntity.model';
import { UsePermissions } from '../decorators/permissions.decorator';
import { PermissionsEnum } from '../core/permissions.enum';
import { BackofficeGroupPermissionGraphQLEntity } from './models/groupPermissionGraphqlEntity.model';

@Resolver()
export class PermissionsResolver {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Query(() => BackofficePermissionsGraphQLEntity)
  @UsePermissions([
    PermissionsEnum.permissionsRead
  ])
  async getPermissions(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('data') payload: GetBackofficePermissionsInput,
  ): Promise<BackofficePermissionsGraphQLEntity> {
    const { permissions, skip, take, total } = await this.permissionsService.getAll({
      skip: payload.skip,
      take: payload.take,
    });

    return new BackofficePermissionsGraphQLEntity({
      permissions: permissions.map((permission) => new BackofficePermissionGraphQLEntity(permission)),
      skip,
      take,
      total,
    });
  }

  @Query(() => [BackofficeGroupPermissionGraphQLEntity])
  async getMyPermissions(
    @UserCredentials() credentials: IUserCredentials,
  ): Promise<BackofficeGroupPermissionGraphQLEntity[]> {
    const { userId } = credentials;

    const permissions = await this.permissionsService.getUserPermissions({
      userId
    });

    return permissions.map((permission) => new BackofficeGroupPermissionGraphQLEntity(permission))
  }
}
