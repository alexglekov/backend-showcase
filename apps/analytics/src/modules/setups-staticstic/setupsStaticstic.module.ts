import { Module } from '@nestjs/common';

import { TopFiveMonthSetupersStaticsticService } from './top-five-month-staticstic/topFiveMonthStaticstic.service';
import { TopFiveMonthSetupersStaticsticResolver } from './top-five-month-staticstic/topFiveMonthStaticstic.resolver';
import {
  TopSetuperByUsersGraphQLEntityResolver,
  TopSetuperByWinrateGraphQLEntityResolver
} from './top-five-month-staticstic/topFiveMonthStaticsticGraphQLModels.resolver';

@Module({
  controllers: [],
  exports: [],
  imports: [],
  providers: [
    TopFiveMonthSetupersStaticsticService,
    TopFiveMonthSetupersStaticsticResolver,

    TopSetuperByUsersGraphQLEntityResolver,
    TopSetuperByWinrateGraphQLEntityResolver,
  ],
})
export class SetupsStaticsticModule {}
