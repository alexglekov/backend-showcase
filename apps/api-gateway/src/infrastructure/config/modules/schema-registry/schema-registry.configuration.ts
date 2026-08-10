import { SchemaRegistryConfig } from './schema-registry.type';

export const loadSchemaRegistryConfig = async (): Promise<SchemaRegistryConfig> => {
  const branchName = process.env.BRANCH_NAME!;
  const graphName = branchName.split('/').join('-');

  return {
    schemaRegistry: {
      apolloStudio: {
        graphId: process.env.APOLLO_STUDIO_GRAPH_ID!,
        variantName: graphName!,
        subgraphName: graphName!,
        apiKey: process.env.APOLLO_STUDIO_API_KEY!,
        revision: 'mock',
      },
    },
  };
};
