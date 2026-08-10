import { Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

@ObjectType({ isAbstract: true })
export class AssetEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly id!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly name!: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Number)
  public readonly precision!: number;

  constructor(asset?: AssetEntity) {
    if (!asset) return;

    this.id = asset.id;
    this.name = asset.name;
    this.precision = asset.precision;
  }
}
