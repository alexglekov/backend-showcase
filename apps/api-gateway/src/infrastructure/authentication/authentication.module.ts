import { Global, Module } from '@nestjs/common';

import { AuthenticationService } from './authentication.service';

@Global()
@Module({
  exports: [AuthenticationService],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
