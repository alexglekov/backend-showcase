import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppsNames } from '@xyro/core';
import { LoggerModule } from '@xyro/libs/logger';
import { ValidationPipe } from '@nestjs/common';
import { validationExceptionFactory, GlobalExceptionFilter } from '@xyro/libs/exceptions';

import { SetupsModule } from './main.module';
import { Config } from './infrastructure/config';

const logger = LoggerModule.loggerFactory();

async function bootstrap() {
  const app = await NestFactory.create(SetupsModule, {
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

  app.enableCors();

  await app.startAllMicroservices();

  await app.listen(port);
  const appUrl = await app.getUrl();

  logger.log(`🚀 [${AppsNames.Setups}] server is running on: ${appUrl}`);
}

bootstrap()
  .catch((error) => {
    logger.error(error);

    process.exit(1);
  });

