import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType({ isAbstract: true })
export class UserEntity {
  @IsString()
  @IsNotEmpty()
  @Field()
  public readonly id!: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  @Field(() => String, { nullable: true })
  public readonly email?: string;

  @IsString()
  @IsOptional()
  @Field(() => String)
  public readonly bio!: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  public readonly name!: string;

  @IsString({ each: true })
  @IsNotEmpty()
  @Field(() => [String])
  public readonly avatarKeys!: string[];

  @IsString({ each: true })
  @IsNotEmpty()
  @Field(() => [String])
  public readonly discordRoles!: string[];

  @IsBoolean()
  @IsNotEmpty()
  @Field(() => Boolean)
  public readonly isInfluencer!: boolean;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly createdAt!: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly updatedAt!: Date;

  @IsString()
  @IsOptional()
  public readonly twitterId?: string;

  @IsString()
  @IsOptional()
  public readonly discordId?: string;

  @IsString()
  @IsOptional()
  public readonly walletAddress?: string;

  constructor(user?: User) {
    if (!user) return;

    this.email = user.email || undefined;
    this.id = user.id;
    this.bio = user.bio;
    this.name = user.name;
    this.discordRoles = user.discordRoles as string[] ?? [];
    this.avatarKeys = user.avatarKeys as string[] ?? [];
    this.isInfluencer = user.isInfluencer;
    this.twitterId = user.twitterId || undefined;
    this.discordId = user.discordId || undefined;
    this.walletAddress = user.walletAddress || undefined;

    this.updatedAt = new Date(user.updatedAt);
    this.createdAt = new Date(user.createdAt);
  }
}