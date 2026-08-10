import { Query, Args, Mutation, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';
import { NotFoundException } from '@nestjs/common';

import { X1000BetsService } from '../services/x1000Bets.service';
import { X1000GameGraphQLEntity } from './models/x1000GameModel.type';
import {
  AddX1000BetInput,
  X1000GamesCounters,
  X1000GamesFilterPaginatedInput,
  X1000GamesPaginatedInput,
} from './models';

import { X1000GameReadService } from '../services/x1000GameRead.service';

@Resolver()
export class X1000GameResolver {
  constructor(
    private readonly x1000BetsService: X1000BetsService,
    private readonly x1000GameReadService: X1000GameReadService
  ) {}

  @Mutation(() => X1000GameGraphQLEntity)
  public async addX1000Bet(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: AddX1000BetInput
  ) {
    const { userId } = credentials;

    const game = await this.x1000BetsService.addBet({
      userId,
      ...data,
    });

    return new X1000GameGraphQLEntity(game);
  }

  @Mutation(() => X1000GameGraphQLEntity)
  async cashOutX1000Game(
    @UserCredentials() credentials: IUserCredentials,
    @Args('gameId') gameId: string
  ) {
    const { userId } = credentials;

    const game = await this.x1000BetsService.cashOut({
      gameId,
      userId,
    });

    return new X1000GameGraphQLEntity(game);
  }

  @Query(() => X1000GamesCounters)
  async getOwnX1000GamesCounters(
    @UserCredentials() credentials: IUserCredentials
  ) {
    const { userId } = credentials;

    return this.x1000GameReadService.getUserGamesCounters(userId);
  }

  @Query(() => [X1000GameGraphQLEntity])
  async getOwnX1000Games(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: X1000GamesFilterPaginatedInput
  ) {
    const { userId } = credentials;

    return this.x1000GameReadService.getUserGames({ userId, ...data });
  }

  @Query(() => [X1000GameGraphQLEntity])
  async getX1000Games(
    @Args('data') data: X1000GamesFilterPaginatedInput
  ): Promise<X1000GameGraphQLEntity[]> {
    const games = await this.x1000GameReadService.getX1000Games({
      ...data,
    });

    return games.map((game) => new X1000GameGraphQLEntity(game));
  }

  @Query(() => X1000GameGraphQLEntity)
  async getX1000Game(
    @Args('id', { type: () => String }) gameId: string
  ): Promise<X1000GameGraphQLEntity> {
    const game = await this.x1000GameReadService.getGameById(gameId);

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return new X1000GameGraphQLEntity(game);
  }

  @Query(() => [X1000GameGraphQLEntity])
  async getLatestWinningX1000Games(
    @Args('data') data: X1000GamesPaginatedInput
  ): Promise<X1000GameGraphQLEntity[]> {
    const games = await this.x1000GameReadService.getLatestWinningGames({
      ...data,
    });

    return games.map((game) => new X1000GameGraphQLEntity(game));
  }
}
