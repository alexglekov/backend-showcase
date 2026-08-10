import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames, ConsumersGroups } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';
import { EventsModule } from '@xyro/libs/events';

import { UpDownModule } from './upDown.module';
import { Config } from './infrastructure/config';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(UpDownModule, {
    logger,
  });

  logger.log(`🚀 [${AppsNames.UpDownWorker}] server starting`);

  connectMicroservices(app);

  await app.startAllMicroservices();

  await app.init();

  logger.log(`🚀 [${AppsNames.UpDownWorker}] server started`);
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: AppsNames.UpDownWorker,
    groupId: ConsumersGroups.UpDownWorkerConsumer,
  });
}

bootstrap()
  .catch((error) => {
    logger.error(error);

    process.exit(1);
  });

