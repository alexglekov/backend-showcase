import { UsePipes, ValidationPipe, applyDecorators } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { validationExceptionFactory } from '@xyro/libs/exceptions';
import { LoggerModule } from '@xyro/libs/logger';
import { ClassStaticMembers } from '@xyro/libs/utils';

import { BaseEvent } from './domainEvent.base';

export const SubscribeDomainEvent = (event: ClassStaticMembers<typeof BaseEvent>): MethodDecorator => {
  const logger = LoggerModule.loggerFactory();

  return applyDecorators(
    EventPattern(event.topic, Transport.KAFKA),
    UsePipes(new ValidationPipe({
      transform: true,
      exceptionFactory(errors) {
        logger.error({
          action: 'Error occured on validating domain event',
          errors,
        })
        return validationExceptionFactory(errors);
      },
    })),
  );
}
