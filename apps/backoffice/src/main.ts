import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppsNames, ConsumersGroups, Environment } from '@xyro/core';
import helmet from 'helmet';
import { LoggerModule } from '@xyro/libs/logger';
import { validationExceptionFactory, GlobalExceptionFilter } from '@xyro/libs/exceptions';

import { BackofficeModule } from './backoffice.module';
import { Config } from './infrastructure/config';
import { EventsModule } from '@xyro/libs/events';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(BackofficeModule, {
    logger,
  });

  const configService = app.get<ConfigService<Config>>(ConfigService);
  const { origins, port, replicaId, env } = configService.get('app');

  app.enableCors({
    credentials: true,
    origin: origins,
  });

  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      skipNullProperties: false,
      transform: true,
      skipUndefinedProperties: false,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(env));

  app.enableShutdownHooks();

  connectMicroservices(app);

  await app.startAllMicroservices();

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Replica ID: ${replicaId}`);

  const url = await app.getUrl();

  logger.log(`🚀 [${AppsNames.Backoffice}] server is running on: ${url}`);

  if (env == Environment.development) {
    logger.log(`🚀 GraphQL Playground: ${url}/graphql/playground`);
  }
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');
  const { replicaId } = configService.get('app');

  
  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: `${ConsumersGroups.BackofficeConsumer}-${replicaId}`,
    groupId: `${ConsumersGroups.BackofficeConsumer}-${replicaId}`,
  });
}

bootstrap()
  .catch((error) => {
    logger.error(error);

    process.exit(1);
  });

