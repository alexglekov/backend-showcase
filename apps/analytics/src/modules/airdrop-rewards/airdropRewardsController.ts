import { Controller, ForbiddenException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AddTelegramBotBonusByWalletAddressPayload, AddTelegramBotBonusByWalletAddressResult } from '@xyro/contracts/analytics';
import { LoggerService } from '@xyro/libs/logger';

import { AirdropRewardsService } from './airdropRewardsService';

@Controller()
export class AirdropRewardsController {
  constructor(
    private readonly airdropRewardsService: AirdropRewardsService,
    private readonly logger: LoggerService,
  ) {}

  @GrpcMethod('AnalyticsService', 'addTelegramBotBonusByWalletAddress')
  async addTelegramBotBonusByWalletAddress(
    data: AddTelegramBotBonusByWalletAddressPayload
  ): Promise<AddTelegramBotBonusByWalletAddressResult> {
    const { payload, signature } = data;
    try {

      await this.airdropRewardsService.addTelegramBotRewards(payload, signature);

      return {
        isBonusAdded: true,
        isSignatureInvalid: false,
        isUserByAddressNotFound: false,
      }
    } catch (error) {
      if (!(error instanceof HttpException) || error instanceof InternalServerErrorException) {
        this.logger.error({
          action: 'Error occured on give telegram bot rewards',
          payload: {
            bodyPayload: payload,
            signature,
            errorMessage: error.message,
            errorStack: error.stack,  
          }
        });

        throw error;
      }

      return {
        isBonusAdded: false,
        isSignatureInvalid: error instanceof ForbiddenException,
        isUserByAddressNotFound: error instanceof NotFoundException,
      }
    }
  }
}
