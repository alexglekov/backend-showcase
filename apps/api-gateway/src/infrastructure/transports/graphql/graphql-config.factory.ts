import { IntrospectAndCompose } from '@apollo/gateway';
import {
  ApolloGatewayDriverConfig,
  ApolloGatewayDriverConfigFactory,
} from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLFormattedError } from 'graphql';
import { Environment } from '@xyro/core';
import { GatewayBuildService } from '@xyro/libs/graphql';

import { Config } from '../../config';

import { contextHandler } from './context-handler';
import { SUBSCRIPTIONS_SUBGRAPH } from './constants';

@Injectable()
export class GraphQLConfigFactory implements ApolloGatewayDriverConfigFactory {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly gatewayBuildService: GatewayBuildService
  ) {}

  createGqlOptions(): Omit<ApolloGatewayDriverConfig, 'driver'> {
    const { serverLists } = this.configService.get('graphql');
    const { env } = this.configService.get('app');

    const playground =
      env === Environment.development
        ? {
            settings: {
              'request.credentials': 'include',
            },
          }
        : false;

    return {
      server: {
        path: '/graphql',
        playground,
        introspection: !!playground,
        csrfPrevention: true,
        context: contextHandler,
        formatError(formattedError: GraphQLFormattedError, error): any {
          return {
            code: formattedError?.extensions?.code,
            message: formattedError?.extensions?.message || 'Internal server error...',
            path: formattedError.path,
            extensions: env === Environment.development ? formattedError.extensions : undefined,
          };
        },
      },
      gateway: {
        buildService: ({ name, url }) =>
          this.gatewayBuildService.buildService({ name, url }),
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            ...serverLists,
            {
              name: SUBSCRIPTIONS_SUBGRAPH,
              url: SUBSCRIPTIONS_SUBGRAPH,
            },
          ],
          pollIntervalInMs: 5000,
        }),
      },
    };
  }
}
