import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { Metadata } from 'grpc';
import {
  AssetAtTimePayload,
  AssetIdPayload,
  AssetPricePayload
} from '@xyro/contracts/prices';

import { PriceReaderService } from './reader.service';

@Controller()
export class PriceReaderController {
  constructor(private readonly priceReaderService: PriceReaderService) {}

  @GrpcMethod('PricesService', 'getAssetCurrentPrice')
  async getAssetCurrentPrice(
    data: AssetIdPayload,
    metadata: Metadata
  ): Promise<AssetPricePayload> {
    try {
      const result = await this.priceReaderService.getAssetCurrentPrice(
        data.assetId
      );

      if (!result) {
        throw new RpcException('Not found');
      }

      return result;
    } catch (e) {
      throw new RpcException(e);
    }
  }

  @GrpcMethod('PricesService', 'getAssetPriceAtTime')
  async refreshSession(
    data: AssetAtTimePayload,
    metadata: Metadata
  ): Promise<AssetPricePayload> {
    try {
      const { assetId, timestamp } = data;

      const result = await this.priceReaderService.getAssetPriceAtTime(
        assetId,
        timestamp
      );

      if (!result) {
        throw new RpcException('Not found');
      }

      return result;
    } catch (e) {
      throw new RpcException(e);
    }
  }
}
