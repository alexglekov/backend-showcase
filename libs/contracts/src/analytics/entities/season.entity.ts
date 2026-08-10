import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Season } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class SeasonEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  public readonly id!: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  public readonly name!: string

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { nullable: false })
  public readonly description!: string

  @IsBoolean()
  @IsNotEmpty()
  public readonly active!: boolean

  constructor(season?: Season) {
    if (!season) return;

    this.id = season.id;
    this.active = season.active;
    this.name = season.name;
    this.description = season.description;
  }
}
