import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@xyro/libs/redis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BetResultEnum } from '@prisma/client';
import { LoggerService } from '@xyro/libs/logger';

import { PrismaService } from '../../../infrastructure/prisma';

interface GetCountActiveBettorsResult {
  bullseye: number;
  updown: number;
  setup: number;
  onevsone: number;
  x1000: number;
}

interface SelectCountResultData {
  count: BigInt
}

const COUNT_ACTIVE_BETTORS_CACHE_KEY = 'countActiveBettors';

@Injectable()
export class CountActiveBettorsService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {
    this.logger.setContext(CountActiveBettorsService.name);
  }

  async onModuleInit() {
    await this.recalculateCountActiveBettors();
  }

  async getCountActiveBettors(): Promise<GetCountActiveBettorsResult> {
    const cachedData = await this.redisService.get<GetCountActiveBettorsResult>(COUNT_ACTIVE_BETTORS_CACHE_KEY);

    if (cachedData) return cachedData;

    return this.recalculateCountActiveBettors();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  private async recalculateCountActiveBettors(): Promise<GetCountActiveBettorsResult> {
    const startProcessingTime = Date.now();

    const [
      [x1000],
      [onevsone],
      [bullseye],
      [setup],
      [updown],
    ] = await Promise.all<[SelectCountResultData][]>([
      await this.prismaService.$queryRawUnsafe(
        `
        SELECT COUNT(*)
        FROM "BetX1000"
        WHERE
            "result"::text IN ($1, $2)
            OR "createdAt" > current_timestamp - interval '1 hours';
        `,
        BetResultEnum.INPROGRESS,
        BetResultEnum.OPEN,
      ),
      await this.prismaService.$queryRawUnsafe(
        `
          SELECT COUNT(*)
          FROM "Bet1vs1"
          WHERE
              "result"::text IN ($1, $2)
              OR "createdAt" > current_timestamp - interval '6 hours';
        `,
        BetResultEnum.INPROGRESS,
        BetResultEnum.OPEN,
      ),
      await this.prismaService.$queryRawUnsafe(
        `
          SELECT COUNT(*)
          FROM "BetBullseye"
          WHERE
              "result"::text IN ($1, $2)
              OR "createdAt" > current_timestamp - interval '40 minutes';
        `,
        BetResultEnum.INPROGRESS,
        BetResultEnum.OPEN,
      ),
      await this.prismaService.$queryRawUnsafe(
        `
          SELECT COUNT(*)
          FROM "BetSetup"
          WHERE
              "result"::text IN ('INPROGRESS', 'OPEN')
        `,
        BetResultEnum.INPROGRESS,
        BetResultEnum.OPEN,
      ),
      await this.prismaService.$queryRawUnsafe(
        `
          SELECT COUNT(*)
          FROM "BetUpDown"
          WHERE
              "result"::text IN ($1, $2)
              OR "createdAt" > current_timestamp - interval '10 minutes';
        `,
        BetResultEnum.INPROGRESS,
        BetResultEnum.OPEN,
      ),
    ]);

    const result: GetCountActiveBettorsResult = {
      x1000: Number(x1000.count),
      onevsone: Number(onevsone.count),
      bullseye: Number(bullseye.count),
      setup: Number(setup.count),
      updown: Number(updown.count),
    };

    await this.redisService.set<GetCountActiveBettorsResult>(
      COUNT_ACTIVE_BETTORS_CACHE_KEY,
      result,
    );

    const endProcessingTime = Date.now();

    this.logger.log({
      action: 'recalculateCountActiveBettors',
      payload: {
        recalculateCountActiveBettorsTime: endProcessingTime - startProcessingTime,
      }
    });

    return result;
  }
}
