import { Field, InputType } from '@nestjs/graphql';
import { Markdown } from '@xyro/libs/graphql';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field(() => Markdown)
  @Length(1, 300)
  @IsString()
  @IsNotEmpty()
  text: string;
  
  @Field()
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  replyToId?: string;
}

@InputType()
export class GetRoomMessagesPaginatedInput {
  @Field()
  roomId: string;

  @Field({ nullable: true, defaultValue: 0 })
  skip: number;

  @Field({ nullable: true, defaultValue: 10 })
  take: number;
}
