import { Module } from '@nestjs/common';

import { WalletsService } from './wallets.service';
import { WalletsResolver } from './resolvers/wallets.resolver';

@Module({
  providers: [WalletsService, WalletsResolver],
  exports: [WalletsService],
})
export class WalletsModule {}
