import { Field, ObjectType } from '@nestjs/graphql';
import { PaymentOrder, PaymentStatus, PaymentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class PaymentOrderEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly id!: string;

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
  @IsNotEmpty()
  @Field(() => String)
  public readonly ownerId!: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  public readonly cancelReason?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly transactionId!: string;

  constructor(paymentOrder?: PaymentOrder) {
    if (!paymentOrder) return;

    this.id = paymentOrder.id;
    this.type = paymentOrder.type;
    this.status = paymentOrder.status;
    this.ownerId = paymentOrder.ownerId;
    this.transactionId = paymentOrder.transactionId;
    this.cancelReason = paymentOrder.cancelReason || undefined;
  }
}
