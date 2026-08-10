import { Field, ObjectType } from '@nestjs/graphql';
import { BetResultEnum, GameTypeEnum } from '@prisma/client';

import { BaseGameResultNotificationPayloadGraphQLEntity } from './baseGameResultPayload.model';
import { X1000GameResultPayload } from '../gamesNotificationPayload.interfaces';

@ObjectType('X1000GameResultNotificationPayload')
export class X1000GameResultNotificationPayloadGraphQLEntity extends BaseGameResultNotificationPayloadGraphQLEntity implements X1000GameResultPayload{
  @Field({ description: 'Initial bet amount', nullable: true })
  amount?: number;

  @Field({ description: 'The amount of money that was won or lost in the game', nullable: true })
  outcome?: number;

  @Field(() => BetResultEnum, { description: 'The bet result' })
  result: BetResultEnum;

  constructor(payload: X1000GameResultPayload) {
    super({
      gameType: GameTypeEnum.X1000,
    });

    this.amount = payload.amount;
    this.outcome = payload.outcome;
    this.result = payload.result;
  }
}