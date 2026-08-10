import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import {
  CreateSetupGameGraphQLInput,
  GetSetupGamesGraphQLInput,
  SetupGamesCounterGraphQLEntity
} from '../graphql-models/setupGameGraphQLModels';
import { SetupGameGraphQLEntity } from '../graphql-models/setupGameGraphQLEntity';
import { SetupGameReadService } from '../services/setupGame.read-service';
import { SetupGameWriteService } from '../services/setupGame.write-service';

@Resolver()
export class SetupGameResolver {
  constructor(
    private setupGameWriteService: SetupGameWriteService,
    private setupGameReadService: SetupGameReadService,
  ) {}

  @Mutation(() => SetupGameGraphQLEntity)
  async createSetupGame(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: CreateSetupGameGraphQLInput
  ): Promise<SetupGameGraphQLEntity> {
    const { userId } = credentials;

    const createdSetupGame = await this.setupGameWriteService.createGame({
      ...data,
      ownerId: userId,
    });

    return new SetupGameGraphQLEntity(createdSetupGame);
  }

  @Query(() => [SetupGameGraphQLEntity])
  async getSetupGames(
    @Args('data') data: GetSetupGamesGraphQLInput,
  ): Promise<SetupGameGraphQLEntity[]> {
    const foundSetupGames = await this.setupGameReadService.getGamesBy({
      ...data,
    });

    return foundSetupGames.map((game) => new SetupGameGraphQLEntity(game));
  }

  @Query(() => [SetupGameGraphQLEntity])
  async getUserSetupGames(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: GetSetupGamesGraphQLInput
  ): Promise<SetupGameGraphQLEntity[]> {
    const { userId } = credentials;

    const games = await this.setupGameReadService.getGamesBy({
      ownerId: userId,
      ...data,
    });

    return games.map((game) => new SetupGameGraphQLEntity(game));
  }

  @Query(() => SetupGameGraphQLEntity)
  async getSetupGame(
    @Args('id', { type: () => String }, new ParseUUIDPipe({ version: '4' })) gameId: string
  ): Promise<SetupGameGraphQLEntity> {
    const game = await this.setupGameReadService.getGameById(gameId);
    return new SetupGameGraphQLEntity(game);
  }

  @Query(() => SetupGamesCounterGraphQLEntity)
  async getSetupGamesCount(@UserCredentials() credentials: IUserCredentials) {
    const { userId } = credentials;
    return this.setupGameReadService.getSetupGamesCount(userId);
  }
}
