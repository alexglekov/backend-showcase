import { Module } from '@nestjs/common';

import { SetupGamesFinalizerService } from './setupGamesResolver.service';
import { SetupGamesFinalizerObserver } from './setupGamesFinalizer.observer';

@Module({
  imports: [],
  controllers: [
    SetupGamesFinalizerObserver,
  ],
  providers: [
    SetupGamesFinalizerService,
  ],
})
export class SetupGamesFinalizerModule {}
