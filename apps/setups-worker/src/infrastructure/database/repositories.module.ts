import { Global, Module } from '@nestjs/common';

import { PrismaModule } from './prisma';
import { SetupGameRepository } from './repositories/setup.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    SetupGameRepository,
  ],
  exports: [
    SetupGameRepository
  ],
})
@Global()
export class DAOModule {}
