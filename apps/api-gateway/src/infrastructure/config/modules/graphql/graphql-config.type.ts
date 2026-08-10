import { DocumentNode } from 'graphql';

export interface GraphQLConfig {
  graphql: {
    serverLists: Array<{
      name: string;
      url: string;
    }>;
    subscriptionsSchema: DocumentNode;
  };
}
