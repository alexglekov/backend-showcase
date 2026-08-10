import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsResolver } from './sessions.resolver';
import {
  RegistUserLoginBackgroundJob,
  RemoveLastSessionOnUserLoginedBackgroundJob,
} from './background-jobs';

@Module({
  imports: [
    JwtModule,
  ],
  controllers: [
    SessionsController,
    RegistUserLoginBackgroundJob,
    RemoveLastSessionOnUserLoginedBackgroundJob,
  ],
  providers: [SessionsService, SessionsResolver],
  exports: [SessionsService],
})
export class SessionsModule {}