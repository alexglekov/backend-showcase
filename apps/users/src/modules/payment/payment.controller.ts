import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { AcceptWithdrawOrderPaylaod, CoinsPaidTransactionPayload, RejectWithdrawOrderPaylaod } from '@xyro/contracts/users';
import { LoggerService } from '@xyro/libs/logger';

import { PaymentService } from './services/payment.service';

@Controller()
export class PaymentController {
  constructor(
    private readonly logger: LoggerService,
    private readonly paymentService: PaymentService
  ) {
    this.logger.setContext(PaymentController.name);
  }

  @GrpcMethod('UsersService', 'CoinsPaidTransactionCallback')
  coinsPaidTransactionCallback(
    data: CoinsPaidTransactionPayload
  ) {
    try {
      return this.paymentService.handleCallback(data);
    } catch (error) {
      this.logger.error(error);

      throw new RpcException(error);
    }
  }

  @GrpcMethod('UsersService', 'AcceptWithdrawOrder')
  async acceptWithdrawOrder(
    data: AcceptWithdrawOrderPaylaod
  ) {
    try {
      await this.paymentService.acceptWithdrawOrder(data);
    } catch (error) {
      this.logger.error(error);

      throw new RpcException(error);
    }
  }

  @GrpcMethod('UsersService', 'RejectWithdrawOrder')
  async rejectWithdrawOrder(
    data: RejectWithdrawOrderPaylaod
  ) {
    try {
      await this.paymentService.rejectWithdrawOrder(data);
    } catch (error) {
      this.logger.error(error);

      throw new RpcException(error);
    }
  }
}
