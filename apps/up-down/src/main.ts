import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames, ConsumersGroups } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';
import { validationExceptionFactory, GlobalExceptionFilter } from '@xyro/libs/exceptions';
import { EventsModule } from '@xyro/libs/events';

import { UpDownModule } from './upDown.module';
import { Config } from './infrastructure/config';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(UpDownModule, {
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

  await app.startAllMicroservices();

  await app.listen(port);

  const appUrl = await app.getUrl();

  logger.log(`🚀 [${AppsNames.UpDown}] server is running on: ${appUrl}`);
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: AppsNames.UpDown,
    groupId: ConsumersGroups.UpDownAppConsumer,
  });
}

bootstrap()
  .catch((error) => {
    logger.error(error);

    process.exit(1);
  });

