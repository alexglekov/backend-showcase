import { Module } from '@nestjs/common';

import { OneVsOneBetsService } from './oneVsOneBets.service';
import { OneVsOneBetsResolver } from './resolvers/oneVsOneBets.resolver';
import { OneVsOneBetGraphQLEntityResolver } from './resolvers/oneVsOneBetModel.resolver';


@Module({
  controllers: [],
  providers: [
    OneVsOneBetsService,

    OneVsOneBetsResolver,
    OneVsOneBetGraphQLEntityResolver
  ],
})
export class OneVsOneBetsModule {}