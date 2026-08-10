import { EventsModule } from '@xyro/libs/events';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { LoggerModule } from '@xyro/libs/logger';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames, ConsumersGroups } from '@xyro/core';
import { GlobalExceptionFilter, validationExceptionFactory } from '@xyro/libs/exceptions';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { LedgerServiceModule } from './ledger.module';
import { Config } from './infrastructure/config';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  logger.log(`🚀 [${AppsNames.Ledger}] server is starting`);

  const app = await NestFactory.create(LedgerServiceModule, {
    logger,
  });

  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { port, env } = configService.get('app');

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

  logger.log(`🚀 [${AppsNames.Ledger}] server is listening on: ${appUrl}`);
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: AppsNames.Ledger,
    groupId: ConsumersGroups.LedgerWorkerConsumer,
  });

  const { server } = configService.get('grpc');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: server,
  });
}

bootstrap()
  .catch((error) => {
    logger.error(error);

    process.exit(1);
  });

