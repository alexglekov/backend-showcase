import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ChallengeTaskPattern } from '@prisma/client';
import { BaseEvent } from '@xyro/libs/events';
import { ClassConstructor } from 'class-transformer';

import { BasePatternHandler } from './basePatternHandler';

@Injectable()
export class ChallengeTaskPatternsHandlersStrategy {
  private readonly eventsToStrategiesMap: Map<
    ClassConstructor<BaseEvent<any>>,
    BasePatternHandler<ChallengeTaskPattern>[]
  > = new Map();

  constructor(
    @Inject(ChallengeTaskPattern.ENRICH_PROFILE)
    private readonly enrichProfilePatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.CONNECT_WITH_X)
    private readonly connectWithXPatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.DISCORD_CHALLENGE)
    private readonly discordChallengePatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.COMMUNITY_CHALLENGE)
    private readonly communityChallengePatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.SHARE_CHALLENGE)
    private readonly shareChallengePatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.INVITE_USERS)
    private readonly inviteUsersPatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.PLAY_ANY_GAME)
    private readonly playAnyGamesPatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.WON_GAMES)
    private readonly wonGamesPatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.WHALE_SQUAD)
    private readonly whaleSquadPatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.PLAY_SETUP_GAMES)
    private readonly playSetupGamesPatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.CREATE_CHAT_MESSAGES)
    private readonly createChatMessagesPatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.CONNECT_WALLET_CHALLENGE)
    private readonly connectWalletChallengePatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.SOCIAL_TRIBE_CHALLENGE)
    private readonly socialTribeChallengePatternHandler: BasePatternHandler<ChallengeTaskPattern>,
    @Inject(ChallengeTaskPattern.SHAROOOORS_CHALLENGE)
    private readonly sharoooorsChallengePatternHandler: BasePatternHandler<ChallengeTaskPattern>,
  ) {}

  onModuleInit() {
    const patternHandlers = this.getPatternHandlers();

    patternHandlers.forEach((patternHandler) => {
      const domainEventsTriggers = patternHandler.getDomainEventsTriggers();
      domainEventsTriggers.forEach((domainEventTrigger) => 
        this.registNewPatternHandler(domainEventTrigger, patternHandler),
      );
    });
  }

  getStrategiesByEvent(domainEventClass: ClassConstructor<any>): BasePatternHandler<ChallengeTaskPattern>[] {
    const strategies = this.eventsToStrategiesMap.get(domainEventClass);
    return strategies ?? [];
  }

  getStrategyByPattern<T extends ChallengeTaskPattern>(pattern: T): BasePatternHandler<T> {
    switch(pattern) {
      case ChallengeTaskPattern.ENRICH_PROFILE : return this.enrichProfilePatternHandler;
      case ChallengeTaskPattern.CONNECT_WITH_X : return this.connectWithXPatternHandler;
      case ChallengeTaskPattern.DISCORD_CHALLENGE : return this.discordChallengePatternHandler;
      case ChallengeTaskPattern.COMMUNITY_CHALLENGE : return this.communityChallengePatternHandler;
      case ChallengeTaskPattern.SHARE_CHALLENGE : return this.shareChallengePatternHandler;
      case ChallengeTaskPattern.INVITE_USERS : return this.inviteUsersPatternHandler;
      case ChallengeTaskPattern.PLAY_ANY_GAME : return this.playAnyGamesPatternHandler;
      case ChallengeTaskPattern.WON_GAMES : return this.wonGamesPatternHandler;
      case ChallengeTaskPattern.WHALE_SQUAD : return this.whaleSquadPatternHandler;
      case ChallengeTaskPattern.PLAY_SETUP_GAMES : return this.playSetupGamesPatternHandler;
      case ChallengeTaskPattern.CREATE_CHAT_MESSAGES : return this.createChatMessagesPatternHandler;
      case ChallengeTaskPattern.CONNECT_WALLET_CHALLENGE : return this.connectWalletChallengePatternHandler;
      case ChallengeTaskPattern.SOCIAL_TRIBE_CHALLENGE : return this.socialTribeChallengePatternHandler;
      case ChallengeTaskPattern.SHAROOOORS_CHALLENGE : return this.sharoooorsChallengePatternHandler;

      default: throw new BadRequestException(`Challenge task pattern handler not found by pattern: ${pattern}.`);
    }
  }

  private getPatternHandlers(): BasePatternHandler<ChallengeTaskPattern>[] {
    return [
      this.enrichProfilePatternHandler,
      this.connectWithXPatternHandler,
      this.discordChallengePatternHandler,
      this.communityChallengePatternHandler,
      this.shareChallengePatternHandler,
      this.inviteUsersPatternHandler,
      this.playAnyGamesPatternHandler,
      this.wonGamesPatternHandler,
      this.whaleSquadPatternHandler,
      this.playSetupGamesPatternHandler,
      this.createChatMessagesPatternHandler,
      this.connectWalletChallengePatternHandler,
      this.socialTribeChallengePatternHandler,
      this.sharoooorsChallengePatternHandler,
    ];
  }

  private registNewPatternHandler(
    domainEventPayloadTrigger: ClassConstructor<BaseEvent<any>>,
    patternHandler: BasePatternHandler<ChallengeTaskPattern>,
  ) {
    const strategies = this.eventsToStrategiesMap.get(domainEventPayloadTrigger) ?? [];

    strategies.push(patternHandler);

    this.eventsToStrategiesMap.set(domainEventPayloadTrigger, strategies);
  }
}
