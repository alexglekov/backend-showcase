import { ClassStaticMembers } from '@xyro/libs/utils';

export type BaseEventPayload = {
  toJSON: () => object;
}

export abstract class BaseEvent<TDomainEventPayload extends BaseEventPayload> {
  abstract eventClass: ClassStaticMembers<typeof BaseEvent>;

  static topic: string;
  abstract payload: TDomainEventPayload;
}
