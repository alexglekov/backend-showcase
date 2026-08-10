import { Query, Resolver } from '@nestjs/graphql';

import { LiveStreamOfBetsService } from './liveStreamOfBets.service';
import { BetGraphQLEntity } from '../../bets/graphql-models';

@Resolver()
export class LiveStreamOfBetsResolver {
  constructor(private readonly service: LiveStreamOfBetsService) {}

  @Query(() => [BetGraphQLEntity])
  getLastLuckyBets() {
    return this.service.getLuckyBets();
  }

  @Query(() => [BetGraphQLEntity])
  getLastHighWagerBets() {
    return this.service.getHighWagerBets();
  }

  @Query(() => [BetGraphQLEntity])
  getLastHighestPnlBets() {
    return this.service.getHighestPnlBets();
  }
}
