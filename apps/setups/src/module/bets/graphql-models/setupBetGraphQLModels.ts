import {
  InputType,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { PaginatedGraphQLInput, PaginatedGraphQLOutput } from '@xyro/libs/graphql';
import { SetupBetGraphQLEntity } from './setupBetGraphQLEntity';
import { BetSetup } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

@InputType('AddSetupBetInput')
export class AddSetupBetGraphQLInput {
  @Field()
  @IsNotEmpty()
  @IsUUID('4')
  gameId: string;
  
  @Field()
  @IsNotEmpty()
  @IsBoolean()
  takeProfit: boolean;
  
  @Field()
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'You entered an incorrect amount, should be more than 1' })
  amount: number;
}

@ObjectType('SetupBets')
export class SetupBetsGraphQLEntity extends PaginatedGraphQLOutput {
  @Field(() => [SetupBetGraphQLEntity])
  bets: SetupBetGraphQLEntity[];

  constructor(entites: BetSetup[], take: number, skip: number) {
    super();

    this.bets = entites.map((entity) => new SetupBetGraphQLEntity(entity));
    this.take = take;
    this.skip = skip;
  }
}

@InputType('GetSetupBetsInput')
export class GetSetupBetsGraphQLInput extends PaginatedGraphQLInput {
  @Field({ nullable: true, defaultValue: true, })
  isActive: boolean;
}
