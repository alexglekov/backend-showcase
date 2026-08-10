import { printSubgraphSchema } from '@apollo/subgraph';
import { ApolloGatewayDriver } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { SchemaRegistryService } from './schemaRegistry.service-port';

const extractSchema = (app: INestApplication): string => {
  const graphQlAdapter = app.get<GraphQLModule<ApolloGatewayDriver>>(GraphQLModule).graphQlAdapter as any;

  const schemaManager = graphQlAdapter.instance.internals.state.schemaManager as any;

  const { schema } = schemaManager.getSchemaDerivedData();

  return printSubgraphSchema(schema);
}

/**
 * @param app - be careful, app must be initialized before getting schema!
 */
export async function publishSchemaToRegistry(app: INestApplication): Promise<void> {
  const schema = await extractSchema(app);

  const schemaRegistryService = app.get(SchemaRegistryService);

  await schemaRegistryService.publishSchema(schema);
}
