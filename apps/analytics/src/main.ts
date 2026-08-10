import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames, ConsumersGroups } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';
import { GlobalExceptionFilter, validationExceptionFactory } from '@xyro/libs/exceptions';

import { AnalyticsAppModule } from './analytics.module';
import { Config } from './infrastructure/config';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(AnalyticsAppModule, {
    logger,
  });

  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { port, env } = configService.get('app');

  app.enableCors();

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

  connectMicroservices(app);

  await app.init();

  await app.startAllMicroservices();

  await app.listen(port);

  const appUrl = await app.getUrl();

  logger.log(`🚀 [${AppsNames.Analytics}] server is running on: ${appUrl}`);
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: AppsNames.Analytics,
    groupId: ConsumersGroups.AnalyticsAppConsumer,
  });

  const { server } = configService.get('grpc');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: server,
  })
}

bootstrap()
  .catch((error) => {
    logger.error(error);

    process.exit(1);
  });

