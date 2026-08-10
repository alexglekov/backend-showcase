import { Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { TopFiveMonthSetupersStaticsticService } from './topFiveMonthStaticstic.service';
import {
  TopMonthSetupersGraphQLEntity,
  TopSetuperByUsersGraphQLEntity,
  TopSetuperByWinrateGraphQLEntity
} from './topFiveMonthStaticsticGraphQL.models';

@Resolver()
export class TopFiveMonthSetupersStaticsticResolver {
  constructor(private readonly service: TopFiveMonthSetupersStaticsticService) {}

  @Query(() => TopMonthSetupersGraphQLEntity)
  async getTopMonthSetupers(
    @UserCredentials(false) credentials?: IUserCredentials,
  ): Promise<TopMonthSetupersGraphQLEntity> {
    const { userId } = credentials || {};

    const topMonth = await this.service.getTopMonthSetupers({ userId });

    return new TopMonthSetupersGraphQLEntity({
      topByUsers: topMonth.topByUsers.map((setuper) => new TopSetuperByUsersGraphQLEntity(
        setuper.position,
        setuper.profit,
        setuper.userId
      )),
      topByWinrate: topMonth.topByWinrate.map((setuper) => new TopSetuperByWinrateGraphQLEntity(
        setuper.position,
        setuper.winratePercentage,
        setuper.userId
      )),
    });
  }
}
