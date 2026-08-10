import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames, ConsumersGroups } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';

import { OneVsOneAppModule } from './appOneVsOneWorker.module';
import { Config } from './infrastructure/config';
import { EventsModule } from '@xyro/libs/events';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(OneVsOneAppModule, {
    logger,
  });

  logger.log(`🚀 [${AppsNames.OneVsOneWorker}] server starting`);

  connectMicroservices(app);

  await app.init();

  await app.startAllMicroservices();

  logger.log(`🚀 [${AppsNames.OneVsOneWorker}] server started`);
}

function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: AppsNames.OneVsOneWorker,
    groupId: ConsumersGroups.OneVsOneWorkerConsumer,
  });
}

bootstrap().catch((error) => {
  logger.error(error);

  process.exit(1);
});
