import { Module } from '@nestjs/common';

import { BetsService } from './services/bets.service';
import { BetResolver } from './resovlers/bet.resolver';
import { BetsResolver } from './resovlers/bets.resolver';
import { CountActiveBettorsService } from './services/countActiveBettorsService';

@Module({
  providers: [
    BetsService,
    CountActiveBettorsService,
    
    BetResolver,
    BetsResolver
  ],
})
export class BetsModule {}
