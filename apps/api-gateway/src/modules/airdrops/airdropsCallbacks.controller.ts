import { Body, Controller, ForbiddenException, Headers, HttpException, Inject, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common';
import { AnalyticsService } from '@xyro/contracts/analytics';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';

import { AddBonusByAddressDto, AddBonusByAddressHeaderDto } from './dtos/addBonusByAddressDto';
import { RequestHeaders } from '../../infrastructure/validations/requestHeaders';

@Controller('/api/rewards')
export class AirdropsController {
  constructor(
    @Inject(AppsNames.Analytics) private readonly analyticsService: AnalyticsService,
  ) {}

  @Post('addByAddress')
  async addBonusByAddress(
    @Body() body: AddBonusByAddressDto,
    @RequestHeaders(AddBonusByAddressHeaderDto) headers: AddBonusByAddressHeaderDto
  ) {
    try {
      const {
        isBonusAdded,
        isSignatureInvalid,
        isUserByAddressNotFound,
      } = await lastValueFrom(
        this.analyticsService.addTelegramBotBonusByWalletAddress({
          payload: JSON.stringify(body, null, 0),
          signature: headers.signature,
        })
      )

      if (isBonusAdded) {
        return {
          message: 'Bonus added',
        }
      }

      if (isSignatureInvalid) {
        throw new ForbiddenException('Signature is invalid');
      }

      if (isUserByAddressNotFound) {
        throw new NotFoundException('User by this address not found');
      }

      throw new InternalServerErrorException()
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}
