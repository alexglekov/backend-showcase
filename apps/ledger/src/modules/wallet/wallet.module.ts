import { Module } from '@nestjs/common';

import { WalletsController } from './wallet.controller';
import { WalletsService } from './wallet.service';
import { WalletsResolver } from './resolvers/wallet.resolver';

@Module({
  controllers: [WalletsController],
  providers: [WalletsService, WalletsResolver],
})
export class WalletsModule {}
