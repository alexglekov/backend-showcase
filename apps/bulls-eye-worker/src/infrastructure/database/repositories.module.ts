import { Global, Module } from '@nestjs/common';

import { PrismaModule } from './prisma';
import { BullsEyeGameRepository } from './repositories/bullsEyeGame.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    BullsEyeGameRepository,
  ],
  exports: [
    BullsEyeGameRepository
  ],
})
@Global()
export class DalModule {}
