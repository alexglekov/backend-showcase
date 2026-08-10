import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma';

import { PriceReaderService } from './reader.service';
import { PricesReaderResolver } from './resolvers/reader.resolver';
import { AssetGraphQLEntityResolver } from './resolvers/assetGraphQlEntity.resolver';
import { PriceReaderController } from './reader.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    PriceReaderService,
    PricesReaderResolver,
    AssetGraphQLEntityResolver,
  ],
  controllers: [PriceReaderController],
  exports: [PriceReaderService],
})
export class PricesReaderModule {}
