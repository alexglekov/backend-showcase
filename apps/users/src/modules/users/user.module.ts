import { Global, Module } from '@nestjs/common';

import { UsersService } from './services/users.service';
import { PrivacyModule } from '../privacy/privacy.module';
import { NotificationsPolicyModule } from '../notifications-policy/notification-policy.module';
import { UserGraphQLEntityResolver } from './resolvers/userGraphQLEntity.resolver';
import { UsersRepository } from './services/users.repository';
import { UsersMutationsResolver } from './resolvers/users.mutations';
import { UsersQueriesResolver } from './resolvers/users.queries';
import { UsersController } from './users.controller';
import { DiscordService } from './services/discord.service';
import { UsersDataLoader } from './resolvers/users.data-loader';

@Global()
@Module({
  imports: [
    PrivacyModule,
    NotificationsPolicyModule
  ],
  controllers: [UsersController],
  providers: [
    DiscordService,

    UsersService,
    UsersRepository,
    
    // GraphQL
    UsersDataLoader,
    UsersMutationsResolver,
    UsersQueriesResolver,
    UserGraphQLEntityResolver,
  ],
  exports: [UsersService],
})
export class UsersModule {}
