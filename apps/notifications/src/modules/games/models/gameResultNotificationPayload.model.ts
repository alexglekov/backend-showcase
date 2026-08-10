import { createUnionType } from '@nestjs/graphql';
import { GameTypeEnum } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';
import { GraphQLEntitiesNames } from '@xyro/core';

import { OneVsOneGameResultNotificationPayloadGraphQLEntity } from './oneVsOneGameResultPayload.model';
import { BaseGameResultNotificationPayloadGraphQLEntity } from './baseGameResultPayload.model';
import { BullsEyeGameResultNotificationPayloadGraphQLEntity } from './bullsEyeGameResultPayload.model';
import { SetupGameResultNotificationPayloadGraphQLEntity } from './setupGameResultPayload.model';
import { UpDownGameResultNotificationPayloadGraphQLEntity } from './upDownGameResultPayload.model';
import { X1000GameResultNotificationPayloadGraphQLEntity } from './x1000GameResultPayload.model';

export const GameResultNotificationPayloadGraphQLEntity = createUnionType({
  types: () => [
    OneVsOneGameResultNotificationPayloadGraphQLEntity,
    BullsEyeGameResultNotificationPayloadGraphQLEntity,
    SetupGameResultNotificationPayloadGraphQLEntity,
    UpDownGameResultNotificationPayloadGraphQLEntity,
    X1000GameResultNotificationPayloadGraphQLEntity,
  ],
  description: 'Supported game result notifications',
  name: GraphQLEntitiesNames.GameResultNotificationPayload,
  resolveType: (value: BaseGameResultNotificationPayloadGraphQLEntity) => {
    const { gameType } = value;

    return getGameResultPayloadClass(gameType);
  }
});

export function getGameResultPayloadClass(gameType: GameTypeEnum): new (...args: any[]) => typeof GameResultNotificationPayloadGraphQLEntity {
  if (gameType === GameTypeEnum.ONEVSONE) return OneVsOneGameResultNotificationPayloadGraphQLEntity;
  if (gameType === GameTypeEnum.SETUP) return SetupGameResultNotificationPayloadGraphQLEntity;
  if (gameType === GameTypeEnum.UPDOWN) return UpDownGameResultNotificationPayloadGraphQLEntity;
  if (gameType === GameTypeEnum.BULLSEYE) return BullsEyeGameResultNotificationPayloadGraphQLEntity;
  if (gameType === GameTypeEnum.X1000) return X1000GameResultNotificationPayloadGraphQLEntity;

  throw new InternalServerErrorException(`UnexpectedError: unsupported game type ${gameType}`);
}

