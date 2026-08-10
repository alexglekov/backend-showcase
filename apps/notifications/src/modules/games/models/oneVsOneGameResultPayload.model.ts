import { Field, ObjectType } from '@nestjs/graphql';
import { BetResultEnum, GameTypeEnum } from '@prisma/client';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { BaseGameResultNotificationPayloadGraphQLEntity } from './baseGameResultPayload.model';
import { OneVsOneGameResultPayload } from '../gamesNotificationPayload.interfaces';

@ObjectType('OneVsOneGameResultNotificationPayload')
export class OneVsOneGameResultNotificationPayloadGraphQLEntity extends BaseGameResultNotificationPayloadGraphQLEntity implements OneVsOneGameResultPayload {
  @Field({ description: 'Initial bet amount', nullable: true })
  amount?: number;

  @Field({ description: 'The amount of money that was won or lost in the game', nullable: true })
  outcome?: number;

  @Field(() => BetResultEnum, { description: 'The bet result' })
  result: BetResultEnum;

  @Field(() => UserGraphQLOrphanEntity, { description: 'Opponent', nullable: true })
  opponent?: UserGraphQLOrphanEntity;

  opponentId?: string;

  constructor(payload: OneVsOneGameResultPayload) {
    super({
      gameType: GameTypeEnum.ONEVSONE,
    });

    this.amount = payload.amount;
    this.outcome = payload.outcome;
    this.result = payload.result;
    this.opponentId = payload.opponentId;
  }
}