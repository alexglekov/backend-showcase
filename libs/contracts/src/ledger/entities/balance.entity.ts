import { Field, ObjectType } from '@nestjs/graphql';
import { Balance } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsNumber, IsDate } from 'class-validator';

@ObjectType({ isAbstract: true })
export class BalanceEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly id!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly accountId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly amount!: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly createdAt!: Date;

  constructor(balance?: Balance) {
    if (!balance) return;

    this.id = balance.id;
    this.createdAt = new Date(balance.createdAt);
    this.accountId = balance.accountId;
    this.amount = Number(balance.amount)
  }
}
