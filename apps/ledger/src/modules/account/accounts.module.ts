import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [],
  controllers: [AccountsController],
  providers: [],
  exports: [],
})
export class AccountsModule {}
