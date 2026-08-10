import { Global, Module } from '@nestjs/common';

import { PrismaModule } from './prisma';
import { UpDownGameRepository } from './repositories/upDown.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    UpDownGameRepository,
  ],
  exports: [
    UpDownGameRepository
  ],
})
@Global()
export class DalModule {}
