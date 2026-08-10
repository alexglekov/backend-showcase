import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames, ConsumersGroups } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';

import { X1000WorkerModule } from './worker.module';
import { Config } from './infrastructure/config';
import { EventsModule } from '@xyro/libs/events';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(X1000WorkerModule, {
    logger,
  });

  connectMicroservices(app);

  await app.init();
  await app.startAllMicroservices();

  logger.log(`🚀 [${AppsNames.X1000Worker}] worker is running`);
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: AppsNames.X1000Worker,
    groupId: ConsumersGroups.X1000WorkerConsumer,
  });
}

bootstrap()
  .catch((error) => {
    logger.error(error);

    process.exit(1);
  });

