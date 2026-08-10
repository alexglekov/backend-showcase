import { Resolver, Query, Args } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';

import { ListCandlesInput } from './types/candle.input';
import { CandleService } from './candle.service';
import { CandleGraphQLEntity } from './types/candleEntityGraphQlEntity';

@Resolver()
export class CandlesResolver {
  constructor(@Inject(CandleService) private candleService: CandleService) {}

  @Query(() => [CandleGraphQLEntity])
  async listCandles(@Args('data') data: ListCandlesInput) {
    return this.candleService.listCandles(data);
  }
}
