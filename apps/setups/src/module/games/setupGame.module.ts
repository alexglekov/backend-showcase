import { Global, Module } from '@nestjs/common';

import { SetupGameWriteService } from './services/setupGame.write-service';
import { SetupGameResolver } from './graphql-resolvers/setupGame.resolver';
import { SetupGameReadService } from './services/setupGame.read-service';
import { SetupGameGraphQLEntityResolver } from './graphql-resolvers/setupGameGraphQLEntity.resolver';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    SetupGameWriteService,
    SetupGameReadService,

    SetupGameResolver,
    SetupGameGraphQLEntityResolver,
  ],
  exports: [SetupGameReadService],
})
export class SetupGameModule {}
