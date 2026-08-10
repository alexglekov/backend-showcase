import { ObjectType } from '@nestjs/graphql';
import { BaseBetEntity } from '@xyro/core';

@ObjectType({ isAbstract: true })
export class UpDownBetEntity extends BaseBetEntity {}
