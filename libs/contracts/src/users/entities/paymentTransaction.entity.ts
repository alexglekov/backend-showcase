import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PaymentStatus, PaymentTransaction, PaymentType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class PaymentTransactionEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly id!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly foreignId!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly paymentSystem!: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  public readonly transactionHash?: string;

  @IsNumber()
  @IsOptional()
  @Field(() => Int, { nullable: true })
  public readonly confirmations?: number;

  @IsString()
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  @Field(() => PaymentStatus)
  public readonly status!: PaymentStatus;

  @IsString()
  @IsEnum(PaymentType)
  @IsNotEmpty()
  @Field(() => PaymentType)
  public readonly type!: PaymentType;

  @IsString()
  @IsOptional()
  @Field(() => String)
  public readonly error?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly currency!: string;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly amount?: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly originalAmount?: number;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly address!: string;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly platformFee?: number;

  @IsNumber()
  @IsOptional()
  @Field(() => Number, { nullable: true })
  public readonly networkFee?: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly createdAt!: Date;

  constructor(paymentTransaction?: PaymentTransaction) {
    if (!paymentTransaction) return;

    this.id = paymentTransaction.id;
    this.foreignId = paymentTransaction.foreignId;
    this.paymentSystem = paymentTransaction.paymentSystem;
    this.transactionHash = paymentTransaction.transactionHash || undefined;
    this.confirmations = paymentTransaction.confirmations || undefined;
    this.status = paymentTransaction.status;
    this.type = paymentTransaction.type;
    this.error = paymentTransaction.error || undefined;
    this.currency = paymentTransaction.currency;
    this.amount = paymentTransaction.amount ? Number(paymentTransaction.amount) : undefined;
    this.originalAmount = paymentTransaction.originalAmount ? Number(paymentTransaction.originalAmount) : undefined;
    this.address = paymentTransaction.address;
    this.platformFee = paymentTransaction.platformFee ? Number(paymentTransaction.platformFee) : undefined;
    this.networkFee = paymentTransaction.networkFee ? Number(paymentTransaction.networkFee) : undefined;
    this.createdAt = new Date(paymentTransaction.createdAt);
  }
}
