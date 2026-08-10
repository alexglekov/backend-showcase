import { Module } from '@nestjs/common';

import { UpDownGameResolver } from './resolvers/upDownGame.resolver';
import { UpDownGameGraphQLEntityResolver } from './resolvers/upDownGameModel.resolver';
import { UpDownGameService } from './upDownGame.service';
import { UpDownDomainEventsListener } from './upDownDomainEventsListener';

@Module({
  controllers: [
    UpDownDomainEventsListener,
  ],
  providers: [
    UpDownGameGraphQLEntityResolver,
    UpDownGameResolver,
    UpDownGameService,
  ],
  exports: [
    UpDownGameService,
  ],
})
export class UpDownGameModule {}
