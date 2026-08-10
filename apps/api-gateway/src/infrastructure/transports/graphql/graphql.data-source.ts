/* eslint-disable max-classes-per-file */
import { Injectable } from '@nestjs/common';
import FileUploadDataSource from '@htempest/apollo-federation-upload';
import { BuildServiceOptions, GatewayBuildService } from '@xyro/libs/graphql';
import { GraphQLDataSource, GraphQLDataSourceProcessOptions, LocalGraphQLDataSource, RemoteGraphQLDataSource } from '@apollo/gateway';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { GatewayGraphQLRequestContext, GatewayGraphQLRequest } from '@apollo/server-gateway-interface';
import { HttpHeaders } from '@xyro/core';
import { GraphQLSchema, Kind } from 'graphql';
import { ConfigService } from '@nestjs/config';
import { Session } from '@xyro/contracts/users';

import { GraphQLContext } from './interfaces';
import { Config, clientConfig } from '../../config';
import { AuthenticationService } from '../../authentication/authentication.service';
import { SUBSCRIPTIONS_SUBGRAPH } from './constants';
import { OnlineCounterService } from '../../../modules/online-counter';

interface BuildRemoteGraphQLDataSourceParams {
  url: string;
}

interface BuildLocalGraphQLDataSourceParams {
  schema: GraphQLSchema;
}

interface TReqObject {
  headers?: Record<string, string>;
}

@Injectable()
export class AuthenticatedDataSource extends GatewayBuildService {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly authenticationService: AuthenticationService,
    private readonly onlineCounterService: OnlineCounterService,
  ) {
    super();
  }

  public buildService(options: BuildServiceOptions & { schema?: GraphQLSchema }): GraphQLDataSource {
    const { name, url } = options;

    if (name === SUBSCRIPTIONS_SUBGRAPH) {
      const { subscriptionsSchema } = this.configService.get('graphql');

      return this.buildLocalGraphQLDataSource({
        schema: buildSubgraphSchema({
          kind: Kind.DOCUMENT,
          typeDefs: subscriptionsSchema,
          resolvers: {
            Query: {
              getCurrentOnline: {
                resolve: async () => {
                  return this.onlineCounterService.getOnlineCount();
                },
              }
            }
          }
        })
      });
    }

    return this.buildRemoteGraphQLDataSource({ url: url! });
  }

  private buildLocalGraphQLDataSource(params: BuildLocalGraphQLDataSourceParams): LocalGraphQLDataSource {
    return new LocalGraphQLDataSource(params.schema);
  }

  private buildRemoteGraphQLDataSource(params: BuildRemoteGraphQLDataSourceParams): RemoteGraphQLDataSource {
    return new (class AuthenticatedDataSource extends FileUploadDataSource {
      constructor(private readonly authenticationService: AuthenticationService) {
        super({
          url: params.url,
          useChunkedTransfer: true,
        });
      }

      async willSendRequest({ context, request }: GraphQLDataSourceProcessOptions<GraphQLContext>) {
        const requestCredentials = this.getInternalEnrichedCredentials(context.req);

        const { user } = context as GraphQLContext;
        const { ip, userAgent, refreshToken, sessionId } = user ?? {};

        const { sessionCredentials, isRefreshed, session } = await this.getCredentialsBySession(sessionId, refreshToken);
        
        if (isRefreshed) {
          context.updateCookies = session;
        }

        const credentials: Record<string, string | undefined> = {
          ...requestCredentials,
          ...sessionCredentials,
          [HttpHeaders.userAgent]: requestCredentials[HttpHeaders.userAgent] || userAgent || '',
          [HttpHeaders.userIp]: requestCredentials[HttpHeaders.userIp] || ip || '',
        }

        this.enrichRequestWithCredentials(credentials, request);
      }

      getInternalEnrichedCredentials(reqObject?: TReqObject) {
        const internalEnrichedCredentials: Record<string, string> = {}
        if (
          !reqObject?.headers
          || Boolean(
            !reqObject.headers?.[HttpHeaders.userId]
            || !reqObject.headers?.[HttpHeaders.sessionId]
            || !reqObject.headers?.[HttpHeaders.refreshToken]
          )
        ) return {}

        if (reqObject.headers[HttpHeaders.userId])
         internalEnrichedCredentials[HttpHeaders.userId] = reqObject.headers[HttpHeaders.userId];

        if (reqObject.headers[HttpHeaders.sessionId])
         internalEnrichedCredentials[HttpHeaders.sessionId] = reqObject.headers[HttpHeaders.sessionId];

        if (reqObject.headers[HttpHeaders.refreshToken])
         internalEnrichedCredentials[HttpHeaders.refreshToken] = reqObject.headers[HttpHeaders.refreshToken];

        if (reqObject.headers[HttpHeaders.userAgent])
         internalEnrichedCredentials[HttpHeaders.userAgent] = reqObject.headers[HttpHeaders.userAgent];

        if (reqObject.headers[HttpHeaders.userIp])
         internalEnrichedCredentials[HttpHeaders.userIp] = reqObject.headers[HttpHeaders.userIp];

        return internalEnrichedCredentials;
        }

      async getCredentialsBySession(sessionId?: string, refreshToken?: string) {
        let session: Session | undefined = undefined;
        let isRefreshed = false;

        if (sessionId) {
          session = await this.authenticationService.getSessionById(sessionId);
        }

        if (!session && refreshToken) {
          session = await this.authenticationService.refreshSession(refreshToken);
          isRefreshed = true;
        }

        return {
          sessionCredentials: session ? {
            [HttpHeaders.userId]: session.userId,
            [HttpHeaders.sessionId]: session.sessionId,
            [HttpHeaders.refreshToken]: session.refreshToken,
          } : {},
          session,
          isRefreshed: isRefreshed && session,
        }
      }

      enrichRequestWithCredentials(
        credentials: Record<string, string | undefined>,
        request?: GatewayGraphQLRequest
      ) {
        if (credentials[HttpHeaders.userId])
          request?.http?.headers?.set(HttpHeaders.userId, credentials[HttpHeaders.userId]!);
        if (credentials[HttpHeaders.sessionId])
          request?.http?.headers?.set(HttpHeaders.sessionId, credentials[HttpHeaders.sessionId]!);
        if (credentials[HttpHeaders.refreshToken])
          request?.http?.headers?.set(HttpHeaders.refreshToken, credentials[HttpHeaders.refreshToken]!);
        request?.http?.headers?.set(HttpHeaders.userAgent, credentials[HttpHeaders.userAgent] || '');
        request?.http?.headers?.set(HttpHeaders.userIp, credentials[HttpHeaders.userIp] || '');
      }

      didReceiveResponse({ context, response }: Required<GatewayGraphQLRequestContext<GraphQLContext>>) {
        context.passthroughCookies = response.http?.headers.get('set-cookie');
        if (context.updateCookies) {
          context.passthroughCookies = `${clientConfig.cookies.sessionId}=none, ${clientConfig.cookies.refreshToken}=none.none.none;`;
        }
        return response;
      }
    })(this.authenticationService);
  }
}
