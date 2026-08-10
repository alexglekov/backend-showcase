import { registerEnumType } from '@nestjs/graphql';
import {
  BetResultEnum,
  BetTypeEnum,
  ChallengeTaskPattern,
  DirectionEnum,
  EntryType,
  FeeTypeEnum,
  GameSetupResultEnum,
  GameStateEnum,
  GameTypeEnum,
  NotificationType,
  PaymentStatus,
  PaymentType,
  UserChallengeTaskStatus,
} from '@prisma/client';

export enum OrderBy {
  asc = 'asc',
  desc = 'desc',
}

export enum GamesListTypeEnum {
  FINISHING = 'FINISHING',
  HIGH_MULTIPLIERS = 'HIGH_MULTIPLIERS',
  INFLUENCERS = 'INFLUENCERS',
}

registerEnumType(PaymentStatus, {
  name: `PaymentStatus`,
});

registerEnumType(UserChallengeTaskStatus, {
  name: `UserChallengeTaskStatus`,
});

registerEnumType(ChallengeTaskPattern, {
  name: `ChallengeTaskPattern`,
});

registerEnumType(PaymentType, {
  name: `PaymentType`,
});

registerEnumType(OrderBy, {
  name: 'OrderBy',
  description: 'The supported order directions.',
});

registerEnumType(GameSetupResultEnum, {
  name: 'GameSetupResult',
  description: 'The supported Setup game results.',
});

registerEnumType(EntryType, {
  name: 'BalanceOperationType',
  description: 'The supported balance operations types.',
});

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'The supported notification types.',
});

registerEnumType(BetTypeEnum, {
  name: 'BetType',
  description: 'The supported bet types.',
});

registerEnumType(FeeTypeEnum, {
  name: 'X1000FeeType',
  description: 'The supported x1000 fees types.',
});

registerEnumType(GameTypeEnum, {
  name: 'GameType',
  description: 'The supported game types.',
});

registerEnumType(DirectionEnum, {
  name: 'OneVsOneBetDirectionType',
  description: 'The supported directions types.',
});

registerEnumType(GameStateEnum, {
  name: 'GameState',
  description: 'The supported game states.',
});

registerEnumType(BetResultEnum, {
  name: 'BetState',
  description: 'The supported bet states.',
});

registerEnumType(GamesListTypeEnum, {
  name: 'GamesListType',
  description: 'The supported lists of games.',
});
