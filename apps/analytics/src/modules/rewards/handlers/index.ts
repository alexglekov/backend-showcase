import { ChallengeTaskPattern } from '@prisma/client';
import { Provider } from '@nestjs/common';

import { EnrichProfilePatternHandler } from './pattern-handlers/enrichProfilePattern.handler';
import { ConnectWithXPatternHandler } from './pattern-handlers/connectWithXPattern.handler';
import { DiscordChallengePatternHandler } from './pattern-handlers/discordChallengePattern.handler';
import { CommunityChallengePatternHandler } from './pattern-handlers/communityChallengePattern.handler';
import { ShareChallengePatternHandler } from './pattern-handlers/shareChallengePattern.handler';

import { ChallengeTaskPatternsHandlersStrategy } from './patternsHandlersStrategy.service';
import { ChallengeTasksHandler } from './challengeTaskHandler';
import { InviteUsersPatternHandler } from './pattern-handlers/inviteUsersPattern.handler';
import { PlayAnyGamesPatternHandler } from './pattern-handlers/playAnyGamesPattern.handler';
import { WonGamesPatternHandler } from './pattern-handlers/wonGamesPattern.handler';
import { WhaleSquadPatternHandler } from './pattern-handlers/whaleSquadPattern.handler';
import { PlaySetupGamesPatternHandler } from './pattern-handlers/playSetupGamesPattern.handler';
import { CreateChatMessagesPatternHandler } from './pattern-handlers/createChatMessagesPattern.handler';
import { ConnectWalletChallengePatternHandler } from './pattern-handlers/connectWalletChallengePattern.handler';
import { SocialTribeChallengePatternHandler } from './pattern-handlers/socialTribeChallengePattern.handler';
import { SharoooorsChallengePatternHandler } from './pattern-handlers/sharoooorsChallengePattern.handler';

export const taskHandlers: Provider[] = [
  {
    provide: ChallengeTaskPattern.ENRICH_PROFILE,
    useClass: EnrichProfilePatternHandler,
  },
  {
    provide: ChallengeTaskPattern.CONNECT_WITH_X,
    useClass: ConnectWithXPatternHandler,
  },
  {
    provide: ChallengeTaskPattern.DISCORD_CHALLENGE,
    useClass: DiscordChallengePatternHandler,
  },
  {
    provide: ChallengeTaskPattern.COMMUNITY_CHALLENGE,
    useClass: CommunityChallengePatternHandler,
  },
  {
    provide: ChallengeTaskPattern.SHARE_CHALLENGE,
    useClass: ShareChallengePatternHandler,
  },
  {
    provide: ChallengeTaskPattern.INVITE_USERS,
    useClass: InviteUsersPatternHandler,
  },
  {
    provide: ChallengeTaskPattern.PLAY_ANY_GAME,
    useClass: PlayAnyGamesPatternHandler,
  },
  {
    provide: ChallengeTaskPattern.WON_GAMES,
    useClass: WonGamesPatternHandler,
  },
  {
    provide: ChallengeTaskPattern.WHALE_SQUAD,
    useClass: WhaleSquadPatternHandler,
  },
  {
    provide: ChallengeTaskPattern.PLAY_SETUP_GAMES,
    useClass: PlaySetupGamesPatternHandler,
  },
  {
    provide: ChallengeTaskPattern.CREATE_CHAT_MESSAGES,
    useClass: CreateChatMessagesPatternHandler,
  },
  {
    provide: ChallengeTaskPattern.CONNECT_WALLET_CHALLENGE,
    useClass: ConnectWalletChallengePatternHandler,
  },
  {
    provide: ChallengeTaskPattern.SOCIAL_TRIBE_CHALLENGE,
    useClass: SocialTribeChallengePatternHandler,
  },
  {
    provide: ChallengeTaskPattern.SHAROOOORS_CHALLENGE,
    useClass: SharoooorsChallengePatternHandler,
  },
  ChallengeTasksHandler,
  ChallengeTaskPatternsHandlersStrategy,
];

export { BasePatternHandler } from './basePatternHandler';
