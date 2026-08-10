import {
  InputType,
  Field,
  ObjectType,
  Int,
} from '@nestjs/graphql';
import { PaginatedGraphQLInput } from '@xyro/libs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, Min } from 'class-validator';

@InputType('GetSetupGameResultInput')
export class GetSetupGameResultGraphQLInput {
  @Field()
  @IsUUID('4')
  @IsNotEmpty()
  gameId: string;
}

@InputType('CreateSetupGameInput')
export class CreateSetupGameGraphQLInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @Field()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  timeframe: number;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  isLong: boolean;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  takeProfit: number;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  stopLoss: number;
}

@InputType('SetupGamesFilterPaginatedInput')
export class GetSetupGamesGraphQLInput extends PaginatedGraphQLInput {
  @Field({ nullable: true, defaultValue: true, })
  isActive!: boolean;
}

@ObjectType('SetupGamesCountType')
export class SetupGamesCounterGraphQLEntity {
  @Field(() => Int)
  activeGamesCount: number;

  @Field(() => Int)
  closeGamesCount: number;
}
