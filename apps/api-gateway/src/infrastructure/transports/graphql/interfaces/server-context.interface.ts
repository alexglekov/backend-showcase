import { GraphQLContext } from './context.interface';

export interface ServerContext extends GraphQLContext {
  passthroughCookies?: string;
}
