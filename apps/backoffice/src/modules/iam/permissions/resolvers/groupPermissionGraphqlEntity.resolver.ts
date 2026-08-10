import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UnprocessableEntityException } from '@nestjs/common';

import { BackofficeUsersService } from '../../users';
import { BackofficeUserGraphQLEntity } from '../../users/models/userGraphqlEntity.model';
import { BackofficeGroupPermissionGraphQLEntity } from './models/groupPermissionGraphqlEntity.model';
import { PermissionsService } from '../services/permissions.service';
import { GroupsService } from '../../groups';
import { BackofficeGroupGraphQLEntity } from '../../groups/models/groupGraphqlEntity.model';
import { BackofficePermissionGraphQLEntity } from './models/permissionGraphqlEntity.model';

@Resolver(() => BackofficeGroupPermissionGraphQLEntity)
export class BackofficeGroupGraphQLEntityResolver {
  constructor(
    private readonly backofficeUsersService: BackofficeUsersService,
    private readonly permissionsService: PermissionsService,
    private readonly groupsService: GroupsService,
  ) {}

  @ResolveField(() => BackofficeUserGraphQLEntity, { nullable: true, name: 'blame' })
  async blame(@Parent() groupPermission: BackofficeGroupPermissionGraphQLEntity): Promise<BackofficeUserGraphQLEntity | null> {
    if (groupPermission.blameId) {
      const user = await this.backofficeUsersService.findById(groupPermission.blameId);
    
      if (user) return new BackofficeUserGraphQLEntity(user);
    }

    return null;
  }

  @ResolveField(() => BackofficeGroupGraphQLEntity, { name: 'group' })
  async group(@Parent() groupPermission: BackofficeGroupPermissionGraphQLEntity): Promise<BackofficeGroupGraphQLEntity> {
    const foundGroup = await this.groupsService.byId(groupPermission.groupId);

    if (!foundGroup) throw new UnprocessableEntityException(`Group by id ${groupPermission.groupId} not found`);

    return new BackofficeGroupGraphQLEntity(foundGroup);
  }

  @ResolveField(() => BackofficePermissionGraphQLEntity, { name: 'permission' })
  async permission(@Parent() groupPermission: BackofficeGroupPermissionGraphQLEntity): Promise<BackofficePermissionGraphQLEntity> {
    const foundPermission = await this.permissionsService.byId(groupPermission.permissionId);

    if (!foundPermission) throw new UnprocessableEntityException(`Permission by id ${groupPermission.permissionId} not found`);

    return new BackofficePermissionGraphQLEntity(foundPermission);
  }
}
