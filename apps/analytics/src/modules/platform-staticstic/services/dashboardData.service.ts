import { RedisService } from '@xyro/libs/redis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateTime, Duration } from 'luxon';
import {
  Injectable,
  OnModuleInit,
} from '@nestjs/common';

import { AnalyticsCacheKeys } from '@xyro/contracts/analytics';

import { PrismaService } from '../../../infrastructure/prisma';
import { AnalyticsLedgerService } from '@xyro/libs/ledger';

type CountableData = {
  count: number;
};

export type DashboardData = {
  date: string;
  activeUsers: number;
  userBets: number;
  totalBets: number;
  income: number;
  from: string;
  to: string;
};

const DATE_FORMAT = 'yyyy/MM/dd';
const DEFAULT_TIMEFRAME = 14; // days
const EXPIRE_TIME = Duration.fromObject({
  days: DEFAULT_TIMEFRAME + 1,
}).seconds;

@Injectable()
export class DashboardDataService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly analyticsLedgerService: AnalyticsLedgerService
  ) {}

  async onModuleInit() {
    this.calcDashboardData();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateData() {
    await this.calcDashboardData();
  }

  async getDashboardData(days = DEFAULT_TIMEFRAME): Promise<DashboardData[]> {
    let data: DashboardData[] = [];

    for (let day = days; day >= 0; day--) {
      const date = DateTime.now().minus({ day });

      const key = `${AnalyticsCacheKeys.graph}:${date.toFormat(DATE_FORMAT)}`;
      const savedPayload = await this.redisService.get<DashboardData>(key);

      if (savedPayload) {
        data.push(savedPayload);
      }
    }

    return data;
  }

  async calcDashboardData(days = DEFAULT_TIMEFRAME) {
    let data: DashboardData[] = [];

    for (let day = days; day >= 0; day--) {
      const dateStart = DateTime.now().minus({ day }).startOf('day');
      const dateEnd = DateTime.now().minus({ day }).endOf('day');
      const date = dateStart.toFormat(DATE_FORMAT);

      const key = `${AnalyticsCacheKeys.graph}:${date}`;
      const savedPayload = await this.redisService.get<DashboardData>(key);

      if (day && savedPayload) {
        data.push(savedPayload);
        continue;
      }

      const activeUsers = await this.getUsersToday(
        dateStart.toJSDate(),
        dateEnd.toJSDate()
      );

      const userBets = await this.getBetUsers(
        dateStart.toJSDate(),
        dateEnd.toJSDate()
      );

      const totalBets = await this.getTotalBets(
        dateStart.toJSDate(),
        dateEnd.toJSDate()
      );

      const income = await this.getIncome(
        dateStart.toJSDate(),
        dateEnd.toJSDate()
      );

      const payload: DashboardData = {
        date,
        activeUsers,
        userBets,
        totalBets,
        income,
        from: dateStart.toISO(),
        to: dateEnd.toISO(),
      };

      data.push(payload);
      await this.redisService.set<DashboardData>(key, payload, {
        expiresInSeconds: EXPIRE_TIME,
      });
    }
  }

  async getUsersToday(from: Date, to: Date) {
    const [{ count }] = await this.prismaService.$queryRaw<CountableData[]>`
      SELECT COUNT(*) AS "count" FROM  
        (SELECT "userId" FROM "Session" 
          WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
          GROUP BY "userId") 
        AS "users";
    `;

    return Number(count);
  }

  async getBetUsers(from: Date, to: Date) {
    const [{ count }] = await this.prismaService.$queryRaw<CountableData[]>`
      SELECT COUNT(*) as "count" FROM
      (
          SELECT "ownerId" FROM "Bet"
          WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
          GROUP BY "ownerId"
      ) AS "users";
    `;

    return Number(count);
  }

  async getTotalBets(from: Date, to: Date) {
    const [{ count }] = await this.prismaService.$queryRaw<CountableData[]>`
      SELECT COUNT(*) AS "count" FROM  
        (SELECT "ownerId" FROM "Bet" 
          WHERE "createdAt" >= ${from} AND "createdAt" <= ${to}
        ) 
        AS "bets";
    `;

    return Number(count);
  }

  async getIncome(from: Date, to: Date) {
    let sum = 0;

    const entries = await this.analyticsLedgerService.getIncomeSumForPeriod({
      from,
      to,
    });

    for (const entry of entries) {
      sum += Number(entry.amount);
    }

    return sum;
  }
}
