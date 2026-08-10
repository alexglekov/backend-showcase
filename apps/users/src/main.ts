import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import { AppsNames, CheckMethodAvailabilityGuard, ConsumersGroups } from '@xyro/core';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { LoggerModule } from '@xyro/libs/logger';
import { GlobalExceptionFilter, validationExceptionFactory } from '@xyro/libs/exceptions';
import { EventsModule } from '@xyro/libs/events';

import { UsersAndAuthModule } from './users.module';
import { Config } from './infrastructure/config';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(UsersAndAuthModule, {
    logger,
  });

  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { port, stage, env } = configService.get('app');

  app.enableCors();

  app.use(cookieParser());

  app.use(graphqlUploadExpress());

  app.useGlobalGuards(new CheckMethodAvailabilityGuard(stage));

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

  logger.log(`🚀 [${AppsNames.Users}] server is running on: ${appUrl}`);
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: AppsNames.Users,
    groupId: ConsumersGroups.UsersAppConsumer,
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

