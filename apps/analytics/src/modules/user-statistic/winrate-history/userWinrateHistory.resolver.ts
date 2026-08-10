import { Args, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { UserWinrateHistoryService } from './userWinrateHistory.service';
import { UserGamesWinratesHistoryGraphQLEntity, GetWinrateDiagramInput } from './winrateGraphql.models';

@Resolver()
export class UserWinrateHistoryResolver {
  constructor(private readonly userWinrateHistoryService: UserWinrateHistoryService) {}

  @Query(() => UserGamesWinratesHistoryGraphQLEntity)
  async getUserGamesWinratesHistory(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('data') data: GetWinrateDiagramInput,
  ): Promise<UserGamesWinratesHistoryGraphQLEntity> {
    return this.userWinrateHistoryService.getGamesWinrateDiagram({
      userId: data.userId,
      intervals: data.intervals,
      period: data.period,
    });
  }
}