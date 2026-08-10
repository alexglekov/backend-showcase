import { Resolver, Query, Args } from '@nestjs/graphql';

import { BullsEyeGameService } from '../bullsEyeGame.service';
import { BullsEyeGameGraphQLEntity } from '../models/bullsEyeGameModel.type';
import { BullsEyeGamesFilterPaginatedInput } from '../models/bullsEyeGraphql.types';

@Resolver()
export class BullsEyeGameResolver {
  constructor(
    private readonly BullsEyeGameService: BullsEyeGameService,
  ) {}

  @Query(() => BullsEyeGameGraphQLEntity)
  async getBullsEyeGameCached(@Args('gameId') gameId: string) {
    const game = await this.BullsEyeGameService.getGameWithBetsFromCache(gameId);

    return new BullsEyeGameGraphQLEntity(game);
  }

  @Query(() => BullsEyeGameGraphQLEntity)
  async getCurrentBullsEyeGame() {
    const currentGame = await this.BullsEyeGameService.getCurrentGameWithBetsFromCache();

    return new BullsEyeGameGraphQLEntity(currentGame);
  }

  @Query(() => [BullsEyeGameGraphQLEntity])
  async getBullsEyeGames(@Args('data') data: BullsEyeGamesFilterPaginatedInput) {
    const games = await this.BullsEyeGameService.getBullsEyeGamesPaginated(
      data,
    );

    return games.map((game) => new BullsEyeGameGraphQLEntity(game));
  }
}
