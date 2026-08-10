import { Module } from '@nestjs/common';

import { GroupsService } from './services/groups.service';
import { GroupsResolver } from './resolvers/groups.resolver';
import { BackofficeGroupGraphQLEntityResolver } from './resolvers/groupGraphqlEntity.resolver';
import { BackofficeUsersModule } from '../users/users.module';
import { NativeGroupsInitService } from './services/groupsInit.service';

@Module({
  imports: [BackofficeUsersModule],
  providers: [NativeGroupsInitService, GroupsService, GroupsResolver, BackofficeGroupGraphQLEntityResolver],
  exports: [GroupsService],
})
export class GroupsModule {}