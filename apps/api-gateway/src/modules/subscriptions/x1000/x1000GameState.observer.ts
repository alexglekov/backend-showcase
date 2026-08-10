import { X1000BetChangedDomainEvent, X1000BetChangedDomainEventPayload, X1000GameEntity } from '@xyro/contracts/x1000'
import { EventPayload, EventsListener, SubscribeStreamingEvent } from '@xyro/libs/events';
import { GameStateEnum } from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';

import { PubSubService } from '../../../infrastructure/pub-sub';
import { GraphQLFederationServerManager } from '../../../infrastructure/graphql';

@EventsListener()
export class X1000GameStateObserver {
  constructor(
    private readonly logger: LoggerService,
    private readonly graphQLFederationServerManager: GraphQLFederationServerManager,
    private readonly pubSubService: PubSubService,
  ) {
    this.logger.setContext(X1000GameStateObserver.name);
  }

  @SubscribeStreamingEvent(X1000BetChangedDomainEvent)
  async onX1000GameChanged(@EventPayload() payload: X1000BetChangedDomainEventPayload) {
    const game: X1000GameEntity = await this.graphQLFederationServerManager.getX1000GameById({}, payload.gameId);

    if (!game) {
      this.logger.log({
        action: 'ApiGateway: X1000GameStateObserver - null in getting x1000 game',
        event: payload,
      });
      return;
    }

    await this.pubSubService.publishX1000GameState(
      payload.ownerId,
      {
        x1000GameState: game as any,
      }
    );

    if (game.state !== GameStateEnum.CLOSE) return;

    await this.pubSubService.publishPublicX1000Game({
      publicX1000Games: {
          ...game,
        } as any,
      }
    );
  }
}
