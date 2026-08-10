import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';
import { validationExceptionFactory, GlobalExceptionFilter } from '@xyro/libs/exceptions';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { MessengerModule } from './messenger.module';
import { Config } from './infrastructure/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(MessengerModule, {
    logger,
  });

  const configService = app.get<ConfigService<Config>>(ConfigService);

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

  logger.log(`🚀 [${AppsNames.Messenger}] server is running on: ${appUrl}`);
}


function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

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

