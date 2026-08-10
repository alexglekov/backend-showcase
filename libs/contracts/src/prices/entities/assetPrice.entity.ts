import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@ObjectType({ isAbstract: true })
export class AssetPriceEntity {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  public readonly id?: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly assetId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly price!: number;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly timestamp!: number;

  constructor(assetPrice?: AssetPriceEntity) {
    if (!assetPrice) return;

    this.assetId = assetPrice.assetId;
    this.price = assetPrice.price;
    this.timestamp = assetPrice.timestamp;
  }
}
