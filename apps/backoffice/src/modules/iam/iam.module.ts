import { Global, Module } from '@nestjs/common';

import { GroupsModule } from './groups/groups.module';
import { BackofficeUsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [GroupsModule, BackofficeUsersModule, PermissionsModule],
  exports: [GroupsModule, BackofficeUsersModule, PermissionsModule],
})
@Global()
export class IamModule {}
