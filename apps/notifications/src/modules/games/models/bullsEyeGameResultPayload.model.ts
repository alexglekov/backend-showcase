import { Field, ObjectType } from '@nestjs/graphql';
import { BetResultEnum, GameTypeEnum } from '@prisma/client';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

import { BaseGameResultNotificationPayloadGraphQLEntity } from './baseGameResultPayload.model';
import { BullsEyeGameResultPayload } from '../gamesNotificationPayload.interfaces';

@ObjectType('BullsEyeGameResultNotificationPayload')
export class BullsEyeGameResultNotificationPayloadGraphQLEntity extends BaseGameResultNotificationPayloadGraphQLEntity implements BullsEyeGameResultPayload {
  @Field({ description: 'Initial bet amount', nullable: true })
  amount?: number;

  @Field({ description: 'The amount of money that was won or lost in the game', nullable: true })
  outcome?: number;

  @Field(() => BetResultEnum, { description: 'The bet result' })
  result: BetResultEnum;

  @Field(() => UserGraphQLOrphanEntity, { nullable: true, description: 'Winner' })
  winner: UserGraphQLOrphanEntity;

  @Field({ description: 'The amount of money the winner won', nullable: true })
  winnerOutcome?: number;

  @Field({ description: 'Indicates the winning accuracy', nullable: true })
  isExact?: boolean;

  winnerId?: string;

  constructor(payload: BullsEyeGameResultPayload) {
    super({
      gameType: GameTypeEnum.BULLSEYE,
    });

    this.amount = payload.amount;
    this.outcome = payload.outcome;
    this.result = payload.result;
    this.winnerOutcome = payload.winnerOutcome;
    this.isExact = payload.isExact;
    this.winnerId = payload.winnerId;
  }
}