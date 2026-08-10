import { InputType, Field, ObjectType, registerEnumType, Int } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { WinrateDiagramSupportedTime } from './userWinrateHistory.service';

registerEnumType(WinrateDiagramSupportedTime, {
  name: 'WinrateDiagramSupportedTime',
  description: 'Supported time periodes for winrate diagram',
})

@InputType()
export class GetWinrateDiagramInput {
  @Field({ nullable: false })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => WinrateDiagramSupportedTime, { nullable: false })
  @IsNotEmpty()
  @IsEnum(WinrateDiagramSupportedTime)
  period: WinrateDiagramSupportedTime;

  @Field(() => Int, { defaultValue: 30, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(10)
  intervals: number;
}

@ObjectType('WinrateDiagramItem')
export class WinrateDiagramItemGraphQLEntity {
  @Field()
  intervals: Date;

  @Field()
  winrate: number;
}

@ObjectType('UserGamesWinratesHistory')
export class UserGamesWinratesHistoryGraphQLEntity {
  @Field(() => [WinrateDiagramItemGraphQLEntity])
  upDown: WinrateDiagramItemGraphQLEntity[];

  @Field(() => [WinrateDiagramItemGraphQLEntity])
  setup: WinrateDiagramItemGraphQLEntity[];

  @Field(() => [WinrateDiagramItemGraphQLEntity])
  bullsEye: WinrateDiagramItemGraphQLEntity[];

  @Field(() => [WinrateDiagramItemGraphQLEntity])
  x1000: WinrateDiagramItemGraphQLEntity[];

  @Field(() => [WinrateDiagramItemGraphQLEntity])
  oneVsOne: WinrateDiagramItemGraphQLEntity[];

  @Field(() => [WinrateDiagramItemGraphQLEntity])
  average: WinrateDiagramItemGraphQLEntity[];
}
