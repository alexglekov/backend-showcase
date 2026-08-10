import { Global, Module } from '@nestjs/common';
import { GraphQLFederationServerManager } from './graphqFederationlServerManager.service';

@Module({
  providers: [
    GraphQLFederationServerManager,
  ],
  exports: [
    GraphQLFederationServerManager,
  ],
})
@Global()
export class GraphQLServerManagerModule {}
