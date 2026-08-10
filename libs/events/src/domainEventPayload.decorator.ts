import { Payload } from '@nestjs/microservices';

export const EventPayload = (): ParameterDecorator => {
  return Payload();
}
