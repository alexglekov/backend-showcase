import { NestFactory } from '@nestjs/core';
import { GraphQLConfig } from './graphql-config.type';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { parse, printSchema } from 'graphql';

import { SubscriptionSchemaCompileModule } from './subscriptionSchemaCompiler.module';

export const loadGraphQLConfig = async (): Promise<GraphQLConfig> => {
  const app = await NestFactory.create(SubscriptionSchemaCompileModule, {});
  await app.init();

  const { schema } = app.get(GraphQLSchemaHost);

  return {
    graphql: {
      serverLists: JSON.parse(process.env.SERVER_LISTS!),
      subscriptionsSchema: parse(printSchema(schema)),
    },
  };
};
