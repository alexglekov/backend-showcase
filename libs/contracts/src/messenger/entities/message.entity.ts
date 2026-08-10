import { Field, ObjectType } from '@nestjs/graphql';
import { Message } from '@prisma/client';
import { Markdown } from '@xyro/libs/graphql';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';

@ObjectType({ isAbstract: true })
export class MessageEntity {
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly id!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => Markdown)
  public readonly text!: string;

  @IsString({ each: true })
  @IsNotEmpty()
  @Field(() => [String])
  public readonly tagList!: string[];

  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  public readonly roomId!: string;

  @IsString()
  @IsNotEmpty()
  public readonly senderId!: string;

  @IsString()
  @IsOptional()
  public readonly replyToId?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  @Field(() => Date)
  public readonly createdAt!: Date;

  constructor(message?: Message) {
    if (!message) return;

    this.id = message.id;
    this.text = message.text;
    this.senderId = message.senderId;
    this.tagList = message.tagList as string[];
    this.roomId = message.roomId;
    this.createdAt = new Date(message.createdAt);
    this.replyToId = message.replyToId || undefined;
  }
}
