import { Module } from '@nestjs/common';

import { OneVsOneGameResolver } from './resolvers/oneVsOneGame.resolver';
import { OneVsOneGameGraphQLEntityResolver } from './resolvers/oneVsOneGameModel.resolver';
import { OneVsOneGameService } from './oneVsOneGame.service';

@Module({
  providers: [
    OneVsOneGameGraphQLEntityResolver,
    OneVsOneGameResolver,

    OneVsOneGameService,
  ],
})
export class OneVsOneGameModule {}