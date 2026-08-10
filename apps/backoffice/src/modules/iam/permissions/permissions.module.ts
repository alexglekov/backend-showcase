import { Module } from '@nestjs/common';

import { PermissionsResolver } from './resolvers/permissions.resolver';
import { PermissionsService } from './services/permissions.service';
import { PermissionsInitService } from './services/permissionsInit.service';
import { GroupsPermissionsResolver } from './resolvers/groupsPermissionsResolver.resolver';
import { BackofficeGroupGraphQLEntityResolver } from './resolvers/groupPermissionGraphqlEntity.resolver';

@Module({
  providers: [
    PermissionsService,
    PermissionsInitService,

    PermissionsResolver,
    GroupsPermissionsResolver,
    BackofficeGroupGraphQLEntityResolver,
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
