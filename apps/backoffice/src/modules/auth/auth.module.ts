import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { InitTestAccountsService } from './services/initTestAccounts.service';

@Module({
  imports: [JwtModule],
  providers: [AuthService, AuthResolver, InitTestAccountsService],
  exports: [AuthService],
})
export class AuthModule {}