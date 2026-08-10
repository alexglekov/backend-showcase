import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames, Environment } from '@xyro/core';
import cookieParser from 'cookie-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import helmet from 'helmet';
import { LoggerModule } from '@xyro/libs/logger';
import { NestExpressApplication } from "@nestjs/platform-express"
import { GlobalExceptionFilter, validationExceptionFactory } from '@xyro/libs/exceptions';

import { ApiGatewayAppModule } from './api-gateway.module';
import { Config } from './infrastructure/config';
import { connectMicroservices } from './infrastructure/transports/kafka';
import { publishSchemaToRegistry } from './infrastructure/third-party/schema-registry';
import { GraphQLFederationServerManager } from './infrastructure/graphql';
import { authenticationHeadersFilterMiddleware } from './infrastructure/authentication';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiGatewayAppModule, {
    logger,
  });

  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { port, env, origins, replicaId } = configService.get('app');

  app.enableCors({
    credentials: true,
    origin: origins,
  });

  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(authenticationHeadersFilterMiddleware);

  app.use(graphqlUploadExpress());

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      exceptionFactory: validationExceptionFactory
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(env));

  await app.init();

  await publishSchemaToRegistry(app);

  await connectMicroservices(app);

  // get graphql-federation server
  const graphQLFederationServerManager = app.get(GraphQLFederationServerManager);
  graphQLFederationServerManager.extractServerFromApp(app);

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Replica ID: ${replicaId}`);

  const url = await app.getUrl();

  logger.log(`🚀 [${AppsNames.ApiGateway}] server is running on: ${url}`);

  if (env == Environment.development) {
    logger.log(`🚀 GraphQL Playground: ${url}/graphql/playground`);
  }
}

bootstrap()
  .catch((error) => {
    logger.error(error);

    process.exit(1);
  });
