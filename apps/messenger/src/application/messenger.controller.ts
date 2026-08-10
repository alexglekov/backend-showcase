import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { GetUserMessagesAmountPayload, GetUserMessagesAmountResult } from '@xyro/contracts/messenger';

import { MessengerService } from './messenger.service';

@Controller()
export class MessengerController {
  constructor(
    private readonly messengerService: MessengerService,
  ) {}

  @GrpcMethod('MessengerService', 'GetUserMessagesAmount')
  async getUserMessagesAmount(
    data: GetUserMessagesAmountPayload
  ): Promise<GetUserMessagesAmountResult> {
    try {
      const userMessagesAmount = await this.messengerService.getUserMessagesAmount(data);

      return {
        amount: userMessagesAmount
      };
    } catch (e) {
      throw new RpcException(e);
    }
  }
}