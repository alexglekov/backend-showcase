import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, PaginatedGraphQLInput, UserCredentials } from '@xyro/libs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';

import { SetupBetsWriteService } from '../services/setupBetsWrite.service';
import { SetupBetGraphQLEntity } from '../graphql-models/setupBetGraphQLEntity';
import {
  AddSetupBetGraphQLInput,
  GetSetupBetsGraphQLInput,
  SetupBetsGraphQLEntity
} from '../graphql-models/setupBetGraphQLModels';
import { SetupBetsReadService } from '../services/setupBetsRead.service';

@Resolver()
export class SetupBetResolver {
  constructor(
    private setupBetsWriteService: SetupBetsWriteService,
    private setupBetsReadService: SetupBetsReadService,
  ) {}

  @Query(() => SetupBetGraphQLEntity)
  async resolveMySetupBet(
    @UserCredentials() credentials: IUserCredentials,
    @Args('gameId', new ParseUUIDPipe({ version: '4' })) gameId: string,
  ) {
    const { userId } = credentials;

    const bet = await this.setupBetsReadService.getBetByGameIdAndOnwerId(gameId, userId);

    return new SetupBetGraphQLEntity(bet);
  }

  @Mutation(() => SetupBetGraphQLEntity)
  async addSetupBet(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: AddSetupBetGraphQLInput
  ): Promise<SetupBetGraphQLEntity> {
    const { userId } = credentials;

    const bet = await this.setupBetsWriteService.addBet({
      ...data,
      userId,
    });

    return new SetupBetGraphQLEntity(bet);
  }

  @Query(() => SetupBetsGraphQLEntity)
  async getUserSetupBets(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: GetSetupBetsGraphQLInput,
  ): Promise<SetupBetsGraphQLEntity> {
    const { userId } = credentials;

    const { bets, skip, take } = await this.setupBetsReadService.getBetsBy({
      ownerId: userId,
      ...data,
    });

    return new SetupBetsGraphQLEntity(bets, take, skip);
  }

  @Query(() => SetupBetsGraphQLEntity)
  async getSetupBets(
    @Args('id', new ParseUUIDPipe({ version: '4' })) setupGameId: string,
    @Args('data') data: PaginatedGraphQLInput,
  ): Promise<SetupBetsGraphQLEntity> {
    const { bets, skip, take } = await this.setupBetsReadService.getBetsBy({
      gameId: setupGameId,
      ...data,
    });

    return new SetupBetsGraphQLEntity(bets, take, skip);
  }
}
