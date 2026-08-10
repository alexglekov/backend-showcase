import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';
import { X1000BetGraphQLOrphanEntity } from '@xyro/contracts/x1000';

import { TodaysX1000LeadersGraphQLEntity } from './todayLeadersStatisticGraphQl.models';
import { TodayX1000LeadersStatisticService } from './todayLeadersStatistic.service';

@Resolver(() => TodaysX1000LeadersGraphQLEntity)
export class TodayX1000LeadersStatisticResolver {
  constructor(private readonly service: TodayX1000LeadersStatisticService) {}

  @Query(() => TodaysX1000LeadersGraphQLEntity)
  async getTodaysX1000Leaders(
    @UserCredentials(false) credentials?: IUserCredentials,
  ): Promise<TodaysX1000LeadersGraphQLEntity> {
    const { userId } = credentials || {};

    const todaysTop = await this.service.getTodaysLeaders({
      userId,
    });

    return new TodaysX1000LeadersGraphQLEntity({
      topByPnl: todaysTop.topByPnl.map((bet) => new X1000BetGraphQLOrphanEntity({ id: bet.betId })),
      topByRoi: todaysTop.topByRoi.map((bet) => new X1000BetGraphQLOrphanEntity({ id: bet.betId })),
      userPositionPnl: todaysTop.userPositionPnl,
      userPositionRoi: todaysTop.userPositionRoi,
    });
  }

  @ResolveField(() => [X1000BetGraphQLOrphanEntity], { name: 'topByRoi' })
  topByRoi(@Parent() todaysX1000Leaders: TodaysX1000LeadersGraphQLEntity) {
    return todaysX1000Leaders.topByRoi.map((bet) => X1000BetGraphQLOrphanEntity.createReference(bet.id))
  }
  
  @ResolveField(() => [X1000BetGraphQLOrphanEntity], { name: 'topByPnl' })
  topByPnl(@Parent() todaysX1000Leaders: TodaysX1000LeadersGraphQLEntity) {
    return todaysX1000Leaders.topByPnl.map((bet) => X1000BetGraphQLOrphanEntity.createReference(bet.id))
  }
}
