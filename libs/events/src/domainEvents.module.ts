import { DynamicModule, Global, INestApplication, InternalServerErrorException, Module, Provider } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LoggerModule } from '@xyro/libs/logger';

import {
  KAFKA_MODULE_CONFIG_TOKEN,
  ConnectDomainEventsListenerOptions,
  DomainEventsModuleAsyncOptions,
  EventsModuleOptions,
  ConnectStreamingEventsListenerOptions
} from './kafkaModule.options';
import { DomainEventsPublisher } from './domainEventsPublisher.service-port';
import { KafkaDomainEventsPublisher } from './kafkaPublisher';
import { KAFKA_PUBLISHER_TOKEN, REDIS_PUBLISHER_TOKEN } from './constants';
import { StreamingEventsPublisher } from './streamingEventsPublisher.service-port';
import { RedisStreamingEventsPublisher } from './redisPublisher';

@Module({})
@Global()
export class EventsModule {
  static forRootAsync(options: DomainEventsModuleAsyncOptions): DynamicModule {
    const imports = options.imports ?? [];
    const exports: any[] = [];
    const providers: Provider[] = [
      {
        provide: KAFKA_MODULE_CONFIG_TOKEN,
        useFactory: options.useFactory,
        inject: options.inject,
      },
    ];

    if (options.useDomainEventsMode) {
      providers.push({
        provide: KAFKA_PUBLISHER_TOKEN,
        useFactory: (options: EventsModuleOptions): ClientProxy | null => {
          const { domainEventsClient } = options;

          if (!domainEventsClient) {
            throw new InternalServerErrorException('Config not provided for DomainEventsClient')
          }

          const { brokers, clientId } = domainEventsClient;

          return ClientProxyFactory.create({
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId,
                brokers,
              },
              producer: {
                allowAutoTopicCreation: true,
              },
              producerOnlyMode: true,
            },
          })
        },
        inject: [KAFKA_MODULE_CONFIG_TOKEN],
      });
      providers.push({
        provide: DomainEventsPublisher,
        useClass: KafkaDomainEventsPublisher,
      });
      exports.push(DomainEventsPublisher);
    }

    if (options.useStreamingEventsMode) {
      providers.push({
        provide: REDIS_PUBLISHER_TOKEN,
        useFactory: (options: EventsModuleOptions): ClientProxy | null => {
          const { streamingEventsClient } = options;

          if (!streamingEventsClient) {
            throw new InternalServerErrorException('Config not provided for StreamingEventsClient')
          }

          const { host, port } = streamingEventsClient;

          return ClientProxyFactory.create({
            transport: Transport.REDIS,
            options: {
              host,
              port,
            },
          })
        },
        inject: [KAFKA_MODULE_CONFIG_TOKEN],
      });
      providers.push({
        provide: StreamingEventsPublisher,
        useClass: RedisStreamingEventsPublisher,
      });
      exports.push(StreamingEventsPublisher);
    }

    imports.push(LoggerModule.forRoot());

    return {
      module: EventsModule,
      global: true,
      imports,
      providers: providers,
      exports,
    };
  }

  static connectDomainEventsListener(app: INestApplication, options: ConnectDomainEventsListenerOptions) {
    const { brokers, clientId, groupId } = options;

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId,
          brokers,
        },
        consumer: {
          groupId,
          allowAutoTopicCreation: true,
        },
      }
    });
  }

  static connectStreamingEventsListener(app: INestApplication, options: ConnectStreamingEventsListenerOptions) {
    const { host, port } = options;

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.REDIS,
      options: {
        host,
        port,
      }
    });
  }
}
