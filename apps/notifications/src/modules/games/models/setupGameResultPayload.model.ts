import { Field, ObjectType } from '@nestjs/graphql';
import { BetResultEnum, GameTypeEnum } from '@prisma/client';

import { BaseGameResultNotificationPayloadGraphQLEntity } from './baseGameResultPayload.model';
import { SetupGameResultPayload } from '../gamesNotificationPayload.interfaces';

@ObjectType('SetupGameResultNotificationPayload')
export class SetupGameResultNotificationPayloadGraphQLEntity extends BaseGameResultNotificationPayloadGraphQLEntity implements SetupGameResultPayload {
  @Field({ description: 'Initial bet amount', nullable: true })
  amount?: number;

  @Field({ description: 'The amount of money that was won or lost in the game', nullable: true })
  outcome?: number;

  @Field(() => BetResultEnum, { description: 'The bet result' })
  result: BetResultEnum;

  constructor(payload: SetupGameResultPayload) {
    super({
      gameType: GameTypeEnum.SETUP,
    });

    this.amount = payload.amount;
    this.outcome = payload.outcome;
    this.result = payload.result;
  }
}