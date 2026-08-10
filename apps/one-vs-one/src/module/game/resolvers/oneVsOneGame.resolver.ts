import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { OneVsOneGameService } from '../oneVsOneGame.service';
import { CreateOneVsOneGameInput, OneVsOneGamesCountType, OneVsOneGamesFilterPaginatedInput } from '../models/oneVsOneGraphql.types';
import { OneVsOneGameGraphQLEntity } from '../models/oneVsOneGameModel.type';

@Resolver()
export class OneVsOneGameResolver {
  constructor(
    private readonly oneVsOneGameService: OneVsOneGameService,
  ) {}

  @Mutation(() => OneVsOneGameGraphQLEntity)
  async createOneVsOneGame(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: CreateOneVsOneGameInput,
  ) {
    const { userId } = credentials;

    const game = await this.oneVsOneGameService.createGame({
      ...data,
      ownerId: userId,
    });

    return new OneVsOneGameGraphQLEntity(game);
  }


  @Mutation(() => OneVsOneGameGraphQLEntity)
  async rejectOneVsOneGameInvitation(
    @UserCredentials() credentials: IUserCredentials,
    @Args('gameId', { type: () => String }) gameId: string,
  ): Promise<OneVsOneGameGraphQLEntity> {
    const { userId } = credentials;

    const game = await this.oneVsOneGameService.rejectGame({
      gameId,
      userId,
    });

    return new OneVsOneGameGraphQLEntity(game);
  }

  @Mutation(() => OneVsOneGameGraphQLEntity)
  async rejectOneVsOneGame(
    @UserCredentials() credentials: IUserCredentials,
    @Args('gameId', { type: () => String }) gameId: string,
  ): Promise<OneVsOneGameGraphQLEntity> {
    const { userId } = credentials;

    const game = await this.oneVsOneGameService.rejectGame({
      gameId,
      userId,
    });

    return new OneVsOneGameGraphQLEntity(game);
  }


  @Query(() => [OneVsOneGameGraphQLEntity])
  async getAvailableGlobalOneVsOneGames(
    @Args('data')
    data: OneVsOneGamesFilterPaginatedInput,
    @UserCredentials(false) credentials?: IUserCredentials,
  ) {
    const { userId } = credentials || {};

    const games = await this.oneVsOneGameService.getAvailableGlobalOneVsOneGames({
      ...data,
      userId,
    });

    return games.map((game) => new OneVsOneGameGraphQLEntity(game));
  }

  @Query(() => [OneVsOneGameGraphQLEntity])
  async getAvailablePersonalOneVsOneGames(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: OneVsOneGamesFilterPaginatedInput,
  ) {
    const { userId } = credentials;

    const games =
      await this.oneVsOneGameService.getAvailablePersonalOneVsOneGames({
        ...data,
        userId,
      });

    return games.map((game) => new OneVsOneGameGraphQLEntity(game));
  }

  @Query(() => OneVsOneGameGraphQLEntity, { nullable: true })
  async getOneVsOneGame(@Args('id', { type: () => String }) gameId: string) {
    const game = await this.oneVsOneGameService.getOneVsOneGameById(gameId);

    return game ? new OneVsOneGameGraphQLEntity(game) : null;
  }

  @Query(() => [OneVsOneGameGraphQLEntity])
  async getOwnOneVsOneGames(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: OneVsOneGamesFilterPaginatedInput,
  ) {
    const { userId } = credentials;

    const games = await this.oneVsOneGameService.getOwnOneVsOneGames({
      ...data,
      userId,
    });

    return games.map((game) => new OneVsOneGameGraphQLEntity(game));
  }


  @Query(() => OneVsOneGamesCountType)
  async getOneVsOneGamesCount(@UserCredentials() credentials: IUserCredentials) {
    const { userId } = credentials;

    return await this.oneVsOneGameService.getOneVsOneGamesCount(userId);
  }

}
