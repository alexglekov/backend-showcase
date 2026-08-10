import { Args, Query, Resolver } from '@nestjs/graphql';
import { IUserCredentials, UserCredentials } from '@xyro/libs/graphql';

import { BetsService } from '../services/bets.service';
import {
  GetBetsGraphQLInput,
  BetsGraphQLEntity,
  CountActiveBettorsGraphQLEntity
} from '../graphql-models';
import { CountActiveBettorsService } from '../services/countActiveBettorsService';

@Resolver()
export class BetsResolver {
  constructor(
    private readonly betsService: BetsService,
    private readonly countActiveBettorsService: CountActiveBettorsService,
  ) {}

  @Query(() => BetsGraphQLEntity)
  async getUserBets(
    @UserCredentials() _credentials: IUserCredentials,
    @Args('data') data: GetBetsGraphQLInput,
  ): Promise<BetsGraphQLEntity> {
    const { bets, skip, take, total } = await this.betsService.getBets({
      ...data,
    });

    return new BetsGraphQLEntity(bets, total, take, skip);
  }

  @Query(() => CountActiveBettorsGraphQLEntity)
  async getCountActiveBettors() {
    const counters = await this.countActiveBettorsService.getCountActiveBettors();

    return new CountActiveBettorsGraphQLEntity(counters);
  }
}
