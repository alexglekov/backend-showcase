import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users';
import { AuthTwitterService } from './twitter/authTwitter.service';
import { AuthTwitterResolver } from './twitter/authTwitter.resolver';
import { AuthDiscordService } from './discord/authDiscord.service';
import { AuthDiscordResolver } from './discord/authDiscord.resolver';
import { AuthBaseService } from './base/authBase.service';
import { AuthBaseResolver } from './base/authBase.resolver';
import { AuthMetamaskResolver } from './metamask/authMetamask.resolver';
import { AuthMetamaskService } from './metamask/authMetamask.service';
import { SessionsModule } from '../sessions/sessions.module';
import { PasswordRecoveryService } from './password-recovery/passwordRecovery.service';
import { PasswordRecoveryResolver } from './password-recovery/passwordRecovery.resolver';
import { ReferralsModule } from '../referrals/referrals.module';
import { Web3Module } from '../../infrastructure/third-party/web3';

@Module({
  imports: [
    Web3Module,
    UsersModule,
    HttpModule,
    JwtModule,
    SessionsModule,
    ReferralsModule,
  ],
  providers: [
    // Services
    AuthTwitterService,
    AuthDiscordService,
    AuthBaseService,
    AuthMetamaskService,
    PasswordRecoveryService,

    // Resolvers
    AuthTwitterResolver,
    AuthDiscordResolver,
    AuthBaseResolver,
    AuthMetamaskResolver,
    PasswordRecoveryResolver,
  ],
  exports: [],
})
export class AuthModule {}
