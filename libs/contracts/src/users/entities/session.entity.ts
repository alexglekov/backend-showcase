import { Session } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SessionEntity {
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  public readonly id!: string;

  @IsString()
  @IsNotEmpty()
  public readonly refreshToken!: string;

  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  public readonly userId!: string;

  @IsString()
  @IsOptional()
  public readonly ip?: string;

  @IsString()
  @IsOptional()
  public readonly agent?: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  public readonly createdAt!: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  public readonly updatedAt!: Date;

  constructor(session?: Session) {
    if (!session) return;

    this.id = session.id;
    this.refreshToken = session.refreshToken;
    this.userId = session.userId;
    this.ip = session.ip || undefined;
    this.agent = session.agent || undefined;
    this.createdAt = new Date(session.createdAt);
    this.updatedAt = new Date(session.updatedAt);
  }
}
