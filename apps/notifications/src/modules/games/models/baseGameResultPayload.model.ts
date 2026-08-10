import { Field, ObjectType } from '@nestjs/graphql';
import { GameTypeEnum } from '@prisma/client';

@ObjectType({ isAbstract: true })
export class BaseGameResultNotificationPayloadGraphQLEntity {
  @Field(() => GameTypeEnum)
  gameType: GameTypeEnum;

  constructor(params: BaseGameResultNotificationPayloadGraphQLEntity) {
    this.gameType = params.gameType;
  }
}