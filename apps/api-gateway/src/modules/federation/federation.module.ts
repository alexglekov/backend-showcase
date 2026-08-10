import { ApolloGatewayDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GatewayBuildService } from '@xyro/libs/graphql';

import { AuthenticatedDataSource, CookieServerPlugin, GraphQLConfigFactory } from '../../infrastructure/transports/graphql';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      driver: ApolloGatewayDriver,
      imports: [GraphQLFederatedModule],
      inject: [GatewayBuildService],
      useClass: GraphQLConfigFactory,
    }),
  ],
  providers: [
    {
      provide: GatewayBuildService,
      useClass: AuthenticatedDataSource,
    },
    CookieServerPlugin,
  ],
  exports: [GatewayBuildService],
})
export class GraphQLFederatedModule {}