import { BaseEvent, BaseEventPayload } from './domainEvent.base';

export abstract class StreamingEventsPublisher {
  abstract publish<T extends BaseEventPayload>(event: BaseEvent<T>): Promise<void>;
}
