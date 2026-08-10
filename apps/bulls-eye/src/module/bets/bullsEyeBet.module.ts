import { Module } from '@nestjs/common';
import { LedgerModule } from '@xyro/libs/ledger';

import { BullsEyeBetsService } from './bullsEyeBets.service';
import { BullsEyeBetsResolver } from './resolvers/bullsEyeBets.resolver';
import { BullsEyeBetGraphQLEntityResolver } from './resolvers/bullsEyeBetModel.resolver';
import { BullsEyeGameModule } from '../game/bullsEye.module';


@Module({
  imports: [
    BullsEyeGameModule,
    LedgerModule.forRoot(false),
  ],
  controllers: [],
  providers: [
    BullsEyeBetsService,

    BullsEyeBetsResolver,
    BullsEyeBetGraphQLEntityResolver
  ],
})
export class BullsEyeBetsModule {}