import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { OneVsOneBetsService } from '../oneVsOneBets.service';
import { OneVsOneBetGraphQLEntity } from '../models/oneVsOneBetModel.type';
import { AddOneVsOneBetInput } from '../models/graphqlModels';


@Resolver()
export class OneVsOneBetsResolver {
  constructor(
    private readonly oneVsOneBetsService: OneVsOneBetsService,
  ) {}

  @Mutation(() => OneVsOneBetGraphQLEntity)
  async addOneVsOneBet(
    @UserCredentials() credentials: IUserCredentials,
    @Args('data') data: AddOneVsOneBetInput,
  ): Promise<OneVsOneBetGraphQLEntity> {
    const { userId } = credentials;

    const bet = await this.oneVsOneBetsService.addBet({
      ...data,
      userId,
    });

    return new OneVsOneBetGraphQLEntity(bet);
  }
}
