import { Module } from '@nestjs/common';

import { LiveStreamOfBetsObserver } from './live-stream-of-bets/liveStreamOfBets.observer';
import { LiveStreamOfBetsService } from './live-stream-of-bets/liveStreamOfBets.service';
import { LiveStreamOfBetsResolver } from './live-stream-of-bets/live-stream-of-bets.resolver';

@Module({
  controllers: [LiveStreamOfBetsObserver],
  providers: [
    LiveStreamOfBetsService,
    LiveStreamOfBetsResolver,
  ],
})
export class LiveStreamsModule {}
