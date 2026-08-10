import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppsNames, ConsumersGroups } from '@xyro/core';
import { EventsModule } from '@xyro/libs/events';

import { Config } from '../../config';

export async function connectMicroservices(app: INestApplication) {
  const configService = app.get<ConfigService<Config>>(ConfigService<Config>);

  const { brokers } = configService.get('kafka');
  const { replicaId } = configService.get('app');

  EventsModule.connectDomainEventsListener(app, {
    brokers,
    clientId: `${AppsNames.ApiGateway}-${replicaId}`,
    groupId: `${ConsumersGroups.ApiGatewayConsumer}-${replicaId}`,
  });

  const { host, port } = configService.get('redis');

  EventsModule.connectStreamingEventsListener(app, {
    host,
    port,
  });

  await app.startAllMicroservices();
}
