import 'reflect-metadata';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PID {
  @Field(() => Number)
  p: number;

  @Field(() => Number)
  i: number;

  @Field(() => Number)
  d: number;
}

@InputType()
export class SetDeviationInput {
  @Field(() => String, { nullable: true })
  assetId: string;

  @Field(() => Number, { nullable: true })
  setTargetDev: number;

  @Field(() => PID, { nullable: true })
  setPidKoef: PID;
}
