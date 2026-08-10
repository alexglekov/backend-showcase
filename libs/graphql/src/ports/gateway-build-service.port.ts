import { GraphQLDataSource }from '@apollo/gateway'

export interface BuildServiceOptions {
  name: string;
  url?: string;
}

export abstract class GatewayBuildService {
  public abstract buildService(options: BuildServiceOptions): GraphQLDataSource;
}
