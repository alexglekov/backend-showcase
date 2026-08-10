import { Module } from '@nestjs/common';
import { TodayX1000LeadersStatisticResolver } from './today-leaders-statistic/todayLeadersStatistic.resolver';
import { TodayX1000LeadersStatisticService } from './today-leaders-statistic/todayLeadersStatistic.service';

@Module({
  providers: [TodayX1000LeadersStatisticResolver, TodayX1000LeadersStatisticService],
})
export class FeatureX1000StatisticModule {}
