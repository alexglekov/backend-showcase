import { GraphQLDataSourceProcessOptions } from '@apollo/gateway';

import { GraphQLContext } from './context.interface';

export interface WillSendRequestOptions {
  context: GraphQLContext;
  request: GraphQLDataSourceProcessOptions['request'];
}
