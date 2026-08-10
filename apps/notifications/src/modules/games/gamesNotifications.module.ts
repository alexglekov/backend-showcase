import { Module } from '@nestjs/common';

import { GamesStateObserver } from './gamesState.observer';
import { GamesNotificationsService } from './gamesNotifications.service';
import { BullsEyeGameResultNotificationPayloadGraphQLEntityResolver } from './resolvers/bullsEyeGameResultPayload.resolver';
import { OneVsOneGameResultNotificationPayloadGraphQLEntityResolver } from './resolvers/oneVsOneGameResultPayload.resolver';

@Module({
  controllers: [GamesStateObserver],
  providers: [
    GamesNotificationsService,

    OneVsOneGameResultNotificationPayloadGraphQLEntityResolver,
    BullsEyeGameResultNotificationPayloadGraphQLEntityResolver,
  ],
})
export class GamesNotificationsModule {}