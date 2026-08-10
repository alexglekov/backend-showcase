import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common';
import { UsersService } from '@xyro/contracts/users';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';

@Controller('/api/coinspaid')
export class CoinsPaidCallbacksController {
  constructor(
    @Inject(AppsNames.Users) private readonly usersService: UsersService,
  ) {}

  @Post('callback')
  async handlePaymentCallback(@Body() body: any, @Headers('x-processing-signature') signature: string) {
    return lastValueFrom(
      this.usersService.coinsPaidTransactionCallback({
        body: JSON.stringify(body, null, 0),
        signature
      })
    )
  }
}