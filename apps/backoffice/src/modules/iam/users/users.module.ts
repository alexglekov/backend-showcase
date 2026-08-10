import { Module } from '@nestjs/common';

import { BackofficeUsersService } from './backofficeUsers.service';
import { BackofficeUsersResolver } from './resolvers/backofficeUsers.resolver';

@Module({
  imports: [],
  providers: [BackofficeUsersResolver, BackofficeUsersService],
  exports: [BackofficeUsersService],
})
export class BackofficeUsersModule {}
