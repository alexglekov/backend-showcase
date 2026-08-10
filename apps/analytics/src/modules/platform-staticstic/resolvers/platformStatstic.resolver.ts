import { Query, Resolver } from '@nestjs/graphql';

import { GlobalBetsStatisticService } from '../services/globalBetsStatistic.service';
import { GlobalBetsStatistics } from './models/platformStatisticsGraphql.models';

@Resolver()
export class PlatformStatsticResolver {
  constructor(
    private readonly globalBetsStatisticService: GlobalBetsStatisticService,
  ) {}

  @Query(() => GlobalBetsStatistics)
  async getGlobalBetsStatistics(): Promise<GlobalBetsStatistics> {
    return this.globalBetsStatisticService.getGlobalBetsStatistic();
  }
}