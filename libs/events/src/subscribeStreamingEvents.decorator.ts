import { UsePipes, ValidationPipe, applyDecorators } from '@nestjs/common';
import { validationExceptionFactory } from '@xyro/libs/exceptions';
import { EventPattern, Transport } from '@nestjs/microservices';
import { ClassStaticMembers } from '@xyro/libs/utils';
import { LoggerModule } from '@xyro/libs/logger';

import { BaseEvent } from './domainEvent.base';

export const SubscribeStreamingEvent = (event: ClassStaticMembers<typeof BaseEvent>): MethodDecorator => {
  const logger = LoggerModule.loggerFactory();

  return applyDecorators(
    EventPattern(event.topic, Transport.REDIS),
    UsePipes(new ValidationPipe({
      transform: true,
      exceptionFactory(errors) {
        logger.error({
          action: 'Error occured on validating streaming event',
          errors,
        })
        return validationExceptionFactory(errors);
      },
    })),
  );
}
