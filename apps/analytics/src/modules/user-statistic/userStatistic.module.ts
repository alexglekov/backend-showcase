import { Module } from '@nestjs/common';

import { UserWinrateHistoryService } from './winrate-history/userWinrateHistory.service';
import { UserWinrateHistoryResolver } from './winrate-history/userWinrateHistory.resolver';
import { UserBetsStatisticService } from './bets/userBetsStatistic.service';
import { UserBetsStatisticResolver } from './bets/userBetsStatistic.resolver';

@Module({
  imports: [
  ],
  providers: [
    UserBetsStatisticService,
    UserBetsStatisticResolver,

    UserWinrateHistoryService,
    UserWinrateHistoryResolver,
  ],
  controllers: [
  ],
})
export class UserStatisticModule {}
