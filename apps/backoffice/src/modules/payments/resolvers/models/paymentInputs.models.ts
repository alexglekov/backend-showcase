import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

@InputType()
export class AcceptWithdrawOrder {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  orderId: string;
}

@InputType()
export class RejectWithdrawOrder {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @Field()
  @IsString()
  @MinLength(10)
  @IsNotEmpty()
  cancelReason: string;
}