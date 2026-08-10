import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames, ConsumersGroups } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';
import { validationExceptionFactory, GlobalExceptionFilter } from '@xyro/libs/exceptions';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { TwitterModule } from './twitter.module';
import { Config } from './infrastructure/config';
import { EventsModule } from '@xyro/libs/events';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(TwitterModule, {
    logger,
  });

  const configService = app.get<ConfigService<Config>>(ConfigService);

  const { env, port } = configService.get('app');

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

  logger.log(`🚀 [${AppsNames.Twitter}] server is running on: ${appUrl}`);
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: AppsNames.Twitter,
    groupId: ConsumersGroups.TwitterAppConsumer,
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

