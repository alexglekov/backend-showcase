import { Controller } from '@nestjs/common';

export const EventsListener = (): ClassDecorator => {
  return Controller();
}
