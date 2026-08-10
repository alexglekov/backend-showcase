import { Field, Int, ObjectType } from '@nestjs/graphql';
import { UserGraphQLOrphanEntity } from '@xyro/contracts/users';

@ObjectType('TopSetuperByWinrate')
export class TopSetuperByWinrateGraphQLEntity {
  @Field(() => Int)
  position: number;

  @Field()
  winratePercentage: number;

  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  user?: UserGraphQLOrphanEntity;

  userId: string;

  constructor(position: number, winratePercentage: number, userId: string) {
    this.position = position;
    this.winratePercentage = winratePercentage;
    this.userId = userId;
  }
}

@ObjectType('TopSetuperByUsers')
export class TopSetuperByUsersGraphQLEntity {
  @Field(() => Int)
  position: number;

  @Field()
  profit: number;

  @Field(() => UserGraphQLOrphanEntity, { nullable: true })
  user: UserGraphQLOrphanEntity;

  userId: string;

  constructor(position: number, profit: number, userId: string) {
    this.position = position;
    this.profit = profit;
    this.userId = userId;
  }
}

@ObjectType('TopMonthSetupers')
export class TopMonthSetupersGraphQLEntity {
  @Field(() => [TopSetuperByWinrateGraphQLEntity])
  topByWinrate: TopSetuperByWinrateGraphQLEntity[];

  @Field(() => [TopSetuperByUsersGraphQLEntity])
  topByUsers: TopSetuperByUsersGraphQLEntity[];

  constructor(payload: TopMonthSetupersGraphQLEntity) {
    this.topByUsers = payload.topByUsers;
    this.topByWinrate = payload.topByWinrate;
  }
}
