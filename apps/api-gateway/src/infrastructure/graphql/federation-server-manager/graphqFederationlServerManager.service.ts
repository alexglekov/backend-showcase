import { INestApplication, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ApolloServer, BaseContext, GraphQLResponse } from '@apollo/server';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver } from '@nestjs/apollo';
import { X1000GameEntity } from '@xyro/contracts/x1000';
import { BullsEyeGameEntity } from '@xyro/contracts/bulls-eye';
import { NotificationEntity } from '@xyro/contracts/notifications';
import { SeasonEntity } from '@xyro/contracts/analytics';
import { IUserCredentials } from '@xyro/libs/graphql';
import { HttpHeaders } from '@xyro/core';

import {
  GET_MESSAGE_BY_ID_GRAHQL_QUERY,
  GET_NOTIFICATION_BY_ID_GRAHQL_QUERY,
  GET_USER_BY_ID_GRAHQL_QUERY,
  GET_UP_DOWN_GAME_BY_ID_GRAHQL_QUERY,
  GET_ONE_VS_ONE_GAME_BY_ID_GRAHQL_QUERY,
  GET_SETUP_GAME_BY_ID_GRAHQL_QUERY,
  GET_PAYMENT_ORDER_BY_ID_GRAHQL_QUERY,
  GET_X1000_GAME_BY_ID_GRAHQL_QUERY,
  GET_BULLS_EYE_GAME_BY_ID_GRAHQL_QUERY,
  GET_USER_SEASON_STATE_BY_USER_ID_GRAHQL_QUERY,
  RESOLVE_MY_SETUP_BET_GRAHQL_QUERY,
} from './queries';

type TContext = {
  credentials?: IUserCredentials;
}

@Injectable()
export class GraphQLFederationServerManager {
  private serverInstance: ApolloServer<BaseContext> | null = null;

  public setServerInstance(instance: ApolloServer<BaseContext>) {
    this.serverInstance = instance;
  }

  public extractServerFromApp(app: INestApplication) {
    const graphQlAdapter = app.get<GraphQLModule<ApolloGatewayDriver>>(GraphQLModule).graphQlAdapter;
    this.setServerInstance(graphQlAdapter.instance);
  }

  private getRequestObject(context: TContext) {
    const { credentials } = context;
    return {
      headers: {
        [HttpHeaders.userId]: credentials?.userId,
        [HttpHeaders.sessionId]: credentials?.sessionId,
        [HttpHeaders.refreshToken]: credentials?.refreshToken,
        [HttpHeaders.userIp]: credentials?.userIp,
        [HttpHeaders.userAgent]: credentials?.userAgent,
      }
    };
  }

  get server(): ApolloServer<BaseContext> {
    if (!this.serverInstance) {
      throw new InternalServerErrorException(`GraphqlServerManager: Instance of Apollo Server is undefined`);
    }
    return this.serverInstance;
  }

  public async getUserById(context: TContext, id: string) {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_USER_BY_ID_GRAHQL_QUERY,
        variables: {
          data: {
            id,
          }
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getUserBy || null;
  }

  public async getUserSeasonStateByUserId(context: TContext, userId: string): Promise<SeasonEntity> {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_USER_SEASON_STATE_BY_USER_ID_GRAHQL_QUERY,
        variables: {
          userId,
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getUserSeasonStateByUserId || null as any;
  }

  public async getMessageById(context: TContext, id: string) {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_MESSAGE_BY_ID_GRAHQL_QUERY,
        variables: {
          id,
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getMessageById || null;
  }

  public async getPaymentOrderById(context: TContext, id: string) {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_PAYMENT_ORDER_BY_ID_GRAHQL_QUERY,
        variables: {
          id,
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getPaymentOrder || null;
  }

  public async getX1000GameById(context: TContext, id: string): Promise<X1000GameEntity> {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_X1000_GAME_BY_ID_GRAHQL_QUERY,
        variables: {
          id,
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getX1000Game || null as any;
  }

  public async getOneVsOneGameById(context: TContext, id: string) {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_ONE_VS_ONE_GAME_BY_ID_GRAHQL_QUERY,
        variables: {
          id,
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getOneVsOneGame || null;
  }

  public async getSetupGameById(context: TContext, id: string) {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_SETUP_GAME_BY_ID_GRAHQL_QUERY,
        variables: {
          id,
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getSetupGame || null;
  }

  public async resolveMySetupBet(context: TContext, gameId: string) {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: RESOLVE_MY_SETUP_BET_GRAHQL_QUERY,
        variables: {
          gameId,
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.resolveMySetupBet || null;
  }

  public async getNotificationById(context: TContext, id: string): Promise<NotificationEntity> {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_NOTIFICATION_BY_ID_GRAHQL_QUERY,
        variables: {
          id,
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getNotificationById || null as any;
  }

  public async getUpDownGameById(context: TContext, gameId: string) {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_UP_DOWN_GAME_BY_ID_GRAHQL_QUERY,
        variables: {
          gameId
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getUpDownGameCached || null;
  }

  public async getBullsEyeGameById(context: TContext, gameId: string): Promise<BullsEyeGameEntity> {
    const graphqlResponse = await this.server.executeOperation(
      {
        query: GET_BULLS_EYE_GAME_BY_ID_GRAHQL_QUERY,
        variables: {
          gameId
        },
      },
      {
        contextValue: {
          req: this.getRequestObject(context),
        }
      }
    );
    const data = this.extractDataFromResponse(graphqlResponse);
    return data.data?.getBullsEyeGameCached || null as any;
  }

  private extractDataFromResponse(response: GraphQLResponse<Record<string, unknown>>) {
    if (response.body.kind === 'single') {
      return response.body.singleResult;
    }
    throw new InternalServerErrorException(`GraphqlServerManager: Unsopported response body kind: ${response.body}`)
  }
}
