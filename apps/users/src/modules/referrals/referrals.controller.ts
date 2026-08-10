import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GetCountInvitedUsersByUserIdPayload, GetCountInvitedUsersByUserIdResult } from '@xyro/contracts/users';
import { LoggerService } from '@xyro/libs/logger';

import { ReferralsService } from './referrals.service';

@Controller()
export class ReferralsController {
  constructor(
    private readonly logger: LoggerService,
    private readonly referralsService: ReferralsService,
  ) {
    this.logger.setContext(ReferralsController.name);
  }

  @GrpcMethod('UsersService', 'GetCountInvitedUsersByUserId')
  async getCountInvitedUsersByUserId(
    data: GetCountInvitedUsersByUserIdPayload
  ): Promise<GetCountInvitedUsersByUserIdResult> {
    return this.referralsService.getCountInvitedUsersByUserId({ userId: data.userId });
  }
}
