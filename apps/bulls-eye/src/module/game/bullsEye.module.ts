import { Module } from '@nestjs/common';

import { BullsEyeGameResolver } from './resolvers/bullsEyeGame.resolver';
import { BullsEyeGameGraphQLEntityResolver } from './resolvers/bullsEyeGameModel.resolver';
import { BullsEyeGameService } from './bullsEyeGame.service';

@Module({
  providers: [
    BullsEyeGameGraphQLEntityResolver,
    BullsEyeGameResolver,
    BullsEyeGameService,
  ],
  exports: [BullsEyeGameService],
})
export class BullsEyeGameModule {}
