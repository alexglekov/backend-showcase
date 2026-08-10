import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { LoggerService } from '@xyro/libs/logger';
import { validate } from 'class-validator';
import { lastValueFrom } from 'rxjs';

import { DomainEventsPublisher } from './domainEventsPublisher.service-port';
import { BaseEvent, BaseEventPayload } from './domainEvent.base';
import { KAFKA_PUBLISHER_TOKEN } from './constants';

@Injectable({ durable: true })
export class KafkaDomainEventsPublisher extends DomainEventsPublisher {
  constructor(
    @Inject(KAFKA_PUBLISHER_TOKEN) private readonly client: ClientKafka,
    private readonly logger: LoggerService,
  ) {
    super();

    this.logger.setContext(KafkaDomainEventsPublisher.name);
  }

  public override async publish<T extends BaseEventPayload>(event: BaseEvent<T>): Promise<void> {
    if (!(event instanceof BaseEvent)) {
      throw new InternalServerErrorException(`Publishing event must be instance of ${BaseEvent.name}`);
    }

    const { eventClass, payload } = event;
    const topic = eventClass.topic;

    const errors = await validate(payload, { skipMissingProperties: false });

    if (errors.length) {
      throw new BadRequestException(errors.toString());
    }

    try {
      await lastValueFrom(this.client.emit(topic, payload.toJSON()));
    } catch (error: any) {
      this.logger.error({
        action: `Error during publish domain event`,
        payload: {
          domainEventName: topic,
          eventPayload: payload,
          errorMessage: error.message,
          errorStack: error.stack,
        }
      });

      throw error;
    }
  }
}
