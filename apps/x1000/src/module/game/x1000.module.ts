import { Module } from '@nestjs/common';

import { X1000BetsService } from './services/x1000Bets.service';
import { X1000GameResolver } from './resolvers/x1000Game.resolver';
import {
  X1000BetGraphQLEntityResolver,
  X1000GameGraphQLEntityResolver,
} from './resolvers/models';
import { X1000GameReadService } from './services/x1000GameRead.service';

@Module({
  providers: [
    X1000BetsService,
    X1000GameReadService,

    X1000GameResolver,
    X1000GameGraphQLEntityResolver,
    X1000BetGraphQLEntityResolver,
  ],
})
export class X1000GameModule {}
