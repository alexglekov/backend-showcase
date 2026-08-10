import {
  UserCreatedDomainEvent,
  UserCreatedDomainEventPayload,
} from '@xyro/contracts/users';
import { EventPayload, EventsListener, SubscribeDomainEvent } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';

import { ReferralRewardsService } from '../referralRewards.service';

@EventsListener()
export class AddBonusForReferralBackgroundJob {
  constructor(
    private readonly referralRewardsService: ReferralRewardsService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AddBonusForReferralBackgroundJob.name);
  }

  @SubscribeDomainEvent(UserCreatedDomainEvent)
  async handleUserCreated(@EventPayload() payload: UserCreatedDomainEventPayload) {
    const { id: userId, referrerId } = payload;

    if (!referrerId) return;

    await this.referralRewardsService.addBonusForReferral({
      isReferrerRewardReceived: false,
      referrerId,
      userId,
    });

    this.logger.log({
      action: 'User received bonus for referral',
      payload: {
        userId,
        referrerId,
      }
    });
  }
}
