import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { UpDownBetsService } from '../upDownBets.service';
import { UpDownBetGraphQLEntity } from '../models/upDownBetGraphQLEntity';
import { AddUpDownBetInput, UpDownBetsFilterPaginatedInput } from '../models/graphqlModels';

@Resolver()
export class UpDownBetsResolver {
  constructor(
    private readonly upDownBetsService: UpDownBetsService,
  ) {}

  @Mutation(() => UpDownBetGraphQLEntity)
  async addUpDownBet(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: AddUpDownBetInput,
  ): Promise<UpDownBetGraphQLEntity | null> {
    const { userId } = credentials;

    const bet = await this.upDownBetsService.addBet({
      amount: data.amount,
      gameId: data.gameId,
      isUp: data.isUp,
      userId,
    });

    return new UpDownBetGraphQLEntity(bet);
  }

  @Query(() => [UpDownBetGraphQLEntity])
  async getUserUpDownBets(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: UpDownBetsFilterPaginatedInput,
  ) {
    const { userId } = credentials;

    const bets = await this.upDownBetsService.getUpDownBetsPaginated({
      ownerId: userId,
      ...data,
    });

    return bets.map((bet) => new UpDownBetGraphQLEntity(bet));
  }

}
