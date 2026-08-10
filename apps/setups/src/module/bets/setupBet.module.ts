import { Global, Module } from '@nestjs/common';

import { SetupBetsReadService } from './services/setupBetsRead.service';
import { SetupBetsWriteService } from './services/setupBetsWrite.service';
import { SetupBetResolver } from './graphql-resolvers/setupBet.resolver';
import { SetupBetGraphQLEntityResolver } from './graphql-resolvers/setupBetGraphQLEntity.resolver';

@Global()
@Module({
  providers: [
    SetupBetsReadService,
    SetupBetsWriteService,

    SetupBetResolver,
    SetupBetGraphQLEntityResolver,
  ],
  exports: [SetupBetsReadService],
})
export class SetupBetModule {}
