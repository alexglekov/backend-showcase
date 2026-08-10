import { Module } from '@nestjs/common';

import { DashboardDataController } from './controllers/dashboardData.controller';

import { GlobalBetsStatisticService } from './services/globalBetsStatistic.service';
import { PlatformStatsticResolver } from './resolvers/platformStatstic.resolver';
import { DashboardDataService } from './services/dashboardData.service';

@Module({
  controllers: [DashboardDataController],
  providers: [
    PlatformStatsticResolver,
    GlobalBetsStatisticService,

    DashboardDataService,
  ],
})
export class PlatformStaticsticModule {}
