import { Module } from '@nestjs/common';
import { LedgerModule } from '@xyro/libs/ledger';

import { UpDownBetsService } from './upDownBets.service';
import { UpDownBetsResolver } from './resolvers/upDownBets.resolver';
import { UpDownBetGraphQLEntityResolver } from './resolvers/upDownBetModel.resolver';
import { UpDownGameModule } from '../game/up-down.module';


@Module({
  imports: [
    UpDownGameModule,
    LedgerModule.forRoot(false),
  ],
  controllers: [],
  providers: [
    UpDownBetsService,

    UpDownBetsResolver,
    UpDownBetGraphQLEntityResolver
  ],
})
export class UpDownBetsModule {}