import { Resolver, Query, Args } from '@nestjs/graphql';

import { UpDownGameService } from '../upDownGame.service';
import { UpDownGameGraphQLEntity } from '../models/upDownGameModel.type';
import { UpDownGamesFilterPaginatedInput } from '../models/upDownGraphql.types';

@Resolver()
export class UpDownGameResolver {
  constructor(
    private readonly upDownGameService: UpDownGameService,
  ) {}

  // @Query(() => UpDownGameGraphQLEntity)
  // async getUpDownGameWithoutCache(@Args('gameId') gameId: string) {
  //   const game = await this.upDownGameService.getGameByIdAndCache(gameId);

  //   return new UpDownGameGraphQLEntity(game);
  // }

  @Query(() => UpDownGameGraphQLEntity)
  async getUpDownGameCached(@Args('gameId') gameId: string) {
    const game = await this.upDownGameService.getGameWithBetsFromCache(gameId);

    return new UpDownGameGraphQLEntity(game);
  }

  @Query(() => UpDownGameGraphQLEntity)
  async getCurrentUpDownGame() {
    const currentGame = await this.upDownGameService.getCurrentGameWithBetsFromCache();

    return new UpDownGameGraphQLEntity(currentGame);
  }

  @Query(() => [UpDownGameGraphQLEntity])
  async getUpDownGames(@Args('data') data: UpDownGamesFilterPaginatedInput) {
    const games = await this.upDownGameService.getLastClosedGames();

    return games.map((game) => new UpDownGameGraphQLEntity(game));
  }
}
